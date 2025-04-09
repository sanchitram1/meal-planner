import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';
import { recipes as recipesTable, Recipe } from '@shared/schema';
import { parseRecipeFile, loadRecipesFromDirectory } from '../server/recipeParser';

// Initialize database connection with neon-http driver
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

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
    
    // Load all recipes from the directory
    const recipes = loadRecipesFromDirectory(directoryPath);
    console.log(`Found ${recipes.length} recipes in ${directoryPath}`);
    
    if (recipes.length === 0) {
      console.log("No recipes found to import.");
      return;
    }
    
    // Format recipes for database insertion
    const formattedRecipes = recipes.map(recipe => {
      // Set default values for required fields that might be missing
      const currentDate = new Date();
      
      // Handle the servings conversion (some recipes might use 'servings' instead of 'serves')
      const servings = (recipe as any).servings || 4;
      
      return {
        title: recipe.title,
        fileName: recipe.fileName || path.basename(recipe.title, '.md'),
        cuisine: recipe.cuisine || recipe.type || "Unknown",
        author: recipe.author || "Unknown",
        serves: recipe.serves || servings,
        ingredients: recipe.ingredients,
        rating: recipe.rating || 0,
        last: currentDate,
        content: recipe.content || "",
        tags: Array.isArray(recipe.tags) ? recipe.tags : 
              (recipe.type ? [recipe.type] : ["other"])
      };
    });
    
    // Insert recipes into the database
    console.log(`Inserting ${formattedRecipes.length} recipes into the database...`);
    
    // Insert recipes in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < formattedRecipes.length; i += batchSize) {
      const batch = formattedRecipes.slice(i, i + batchSize);
      await db.insert(recipesTable).values(batch);
      console.log(`Inserted batch ${i/batchSize + 1} of ${Math.ceil(formattedRecipes.length/batchSize)}`);
    }
    
    console.log("✅ Recipe import completed successfully!");
  } catch (error) {
    console.error("❌ Error importing recipes:", error);
    process.exit(1);
  }
}

// Check if directory path is provided as command line argument
const directoryPath = process.argv[2];
if (!directoryPath) {
  console.error("Please provide the path to your recipe markdown files.");
  console.error("Usage: npm run import-recipes -- /path/to/your/recipes");
  process.exit(1);
}

// Run the import function
importRecipes(directoryPath);