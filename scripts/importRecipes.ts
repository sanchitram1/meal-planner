import path from 'path';
import fs from 'fs';
import { Recipe } from '@shared/schema';
import { parseRecipeFile, loadRecipesFromDirectory } from '../server/recipeParser';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { recipes } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
      console.error('DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    // Initialize database connection with neon-http driver
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Load all recipes from the directory
    console.log(`Loading recipes from ${directoryPath}...`);
    const recipeObjects = loadRecipesFromDirectory(directoryPath);
    console.log(`Found ${recipeObjects.length} recipe files`);
    
    if (recipeObjects.length === 0) {
      console.warn("No valid recipes found in the directory");
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each recipe individually for better error handling
    for (const recipe of recipeObjects) {
      try {
        const recipeToInsert = {
          ...recipe,
          type: recipe.type || 'other',
          last: new Date(recipe.last)
        };
        
        // Check if recipe already exists
        const existingRecipe = await db.select()
          .from(recipes)
          .where(eq(recipes.fileName, recipe.fileName))
          .limit(1);
        
        if (existingRecipe.length > 0) {
          // Update existing recipe
          await db.update(recipes)
            .set(recipeToInsert)
            .where(eq(recipes.fileName, recipe.fileName));
        } else {
          // Insert new recipe
          await db.insert(recipes).values(recipeToInsert);
        }
        
        successCount++;
        console.log(`Successfully imported: ${recipe.title}`);
      } catch (err) {
        errorCount++;
        console.error(`Failed to import recipe: ${recipe.title}`, err);
      }
      
      // Short delay to avoid database overload
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n========== IMPORT SUMMARY ==========`);
    console.log(`Total recipes found: ${recipeObjects.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed to import: ${errorCount}`);
    console.log(`====================================\n`);
    
    if (successCount > 0) {
      console.log("🎉 Recipe import complete! Your recipes are now available in the app.");
    } else {
      console.error("❌ No recipes were imported successfully.");
    }
    
  } catch (error) {
    console.error("❌ Error importing recipes:", error);
    process.exit(1);
  }
}

// Check if directory path is provided as command line argument
const directoryPath = process.argv[2] || 'recipes';
importRecipes(directoryPath);