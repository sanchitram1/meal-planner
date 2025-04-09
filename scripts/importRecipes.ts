import path from "path";
import fs from "fs";
import { Recipe } from "@shared/schema";
import {
  parseRecipeFile,
  loadRecipesFromDirectory,
} from "../server/recipeParser";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { recipes } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Validates a recipe based on specific criteria
 * @param recipe The recipe to validate
 * @param filePath Path to the recipe file (for reporting)
 * @returns Object with validation result and reason if invalid
 */
function validateRecipe(
  recipe: Recipe,
  filePath: string,
): { valid: boolean; reason?: string } {
  // Check if the recipe has any of the required meal type tags
  const hasMealTypeTag = recipe.tags.some((tag) =>
    ["breakfast", "lunch", "dinner"].includes(tag.toLowerCase()),
  );

  if (!hasMealTypeTag) {
    return {
      valid: false,
      reason: `Missing meal type tag (breakfast, lunch, or dinner): ${filePath}`,
    };
  }

  // Check if the recipe content contains a TODO item
  if (recipe.content.includes("- [ ] TODO")) {
    return {
      valid: false,
      reason: `Contains TODO items: ${filePath}`,
    };
  }

  return { valid: true };
}

/**
 * Import recipes from markdown files into the database
 * @param directoryPath Path to the directory containing recipe markdown files
 */
async function importRecipes(directoryPath: string) {
  try {
    console.log(`Importing recipes from: ${directoryPath}`);

    // Make sure the directory exists
    if (!fs.existsSync(directoryPath)) {
      console.error(`Directory not found: ${directoryPath}`);
      process.exit(1);
    }

    // Set up database connection
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set");
      process.exit(1);
    }

    // Initialize database connection with neon-http driver
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Get list of all files in the directory
    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".md"));

    console.log(`Found ${files.length} markdown files in ${directoryPath}`);

    // Arrays to track files for reporting
    const invalidFiles: string[] = [];
    const skippedExistingFiles: string[] = [];
    const validRecipes: Recipe[] = [];

    // Get existing recipes to check for duplicates
    const existingRecipes = await db
      .select({
        fileName: recipes.fileName,
      })
      .from(recipes);

    const existingFileNames = new Set(existingRecipes.map((r) => r.fileName));

    // Process each file individually, validate first without database operations
    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      // Check if file is already in the database
      if (existingFileNames.has(file)) {
        skippedExistingFiles.push(file);
        continue;
      }

      // Parse the recipe file
      const recipe = parseRecipeFile(filePath);

      if (!recipe) {
        invalidFiles.push(`Could not parse file: ${file}`);
        continue;
      }

      // Validate the recipe
      const validation = validateRecipe(recipe, file);
      if (!validation.valid) {
        invalidFiles.push(validation.reason!);
        continue;
      }

      validRecipes.push(recipe);
    }

    // Log files that were skipped
    if (skippedExistingFiles.length > 0) {
      console.log("\n📋 Skipped existing files:");
      skippedExistingFiles.forEach((file) => {
        console.log(`  • ${file}`);
      });
    }

    // Log files that were invalid
    if (invalidFiles.length > 0) {
      console.log("\n⚠️ Skipped invalid files:");
      invalidFiles.forEach((reason) => {
        console.log(`  • ${reason}`);
      });
    }

    if (validRecipes.length === 0) {
      console.warn("\n⚠️ No valid recipes to import");
      process.exit(0);
    }

    console.log(`\n🔄 Importing ${validRecipes.length} valid recipes...`);

    let successCount = 0;
    let errorCount = 0;

    // Process each valid recipe
    for (const recipe of validRecipes) {
      try {
        const recipeToInsert = {
          ...recipe,
          type: recipe.type || "other",
          last: new Date(recipe.last),
        };

        // Insert new recipe (we've already filtered out existing ones)
        await db.insert(recipes).values(recipeToInsert);

        successCount++;
        console.log(`✅ Successfully imported: ${recipe.title}`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Failed to import recipe: ${recipe.title}`, err);
      }

      // Short delay to avoid database overload
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n========== IMPORT SUMMARY ==========`);
    console.log(`Total markdown files found: ${files.length}`);
    console.log(
      `Already in database (skipped): ${skippedExistingFiles.length}`,
    );
    console.log(`Invalid recipes (skipped): ${invalidFiles.length}`);
    console.log(`Valid recipes to import: ${validRecipes.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed to import: ${errorCount}`);
    console.log(`====================================\n`);

    if (successCount > 0) {
      console.log(
        "🎉 Recipe import complete! Your recipes are now available in the app.",
      );
    } else {
      console.error("❌ No recipes were imported successfully.");
    }
  } catch (error) {
    console.error("❌ Error importing recipes:", error);
    process.exit(1);
  }
}

// Check if directory path is provided as command line argument
const directoryPath = process.argv[2] || "recipes";
importRecipes(directoryPath);
