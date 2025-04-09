import path from 'path';
import fs from 'fs';
import { parseRecipeFile, loadRecipesFromDirectory } from '../server/recipeParser';
import { Recipe } from '@shared/schema';

/**
 * Test parse recipes from markdown files without importing to database
 * @param directoryPath Path to the directory containing recipe markdown files
 */
async function testImport(directoryPath: string) {
  try {
    console.log(`Testing recipe import from: ${directoryPath}`);
    
    // Make sure the directory exists
    if (!fs.existsSync(directoryPath)) {
      console.error(`Directory not found: ${directoryPath}`);
      process.exit(1);
    }
    
    // Load all recipes from the directory
    const files = fs.readdirSync(directoryPath);
    
    // Process files one at a time for detailed debugging
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(directoryPath, file);
      console.log(`\n--------------------------------------------`);
      console.log(`Processing file: ${file}`);
      
      // Read the raw file
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`\nRAW CONTENT (first 500 chars):\n${rawContent.slice(0, 500)}...`);
      
      // Parse the file
      const parsedRecipe = parseRecipeFile(filePath);
      
      if (parsedRecipe) {
        console.log(`\nPARSED RECIPE RESULT:`);
        console.log(JSON.stringify(parsedRecipe, null, 2));
        
        // Check for specific issues mentioned
        console.log(`\nPROBLEM ANALYSIS:`);
        
        // 1. Check for Obsidian references
        const hasObsidianRefs = JSON.stringify(parsedRecipe).includes('[[') || 
                                JSON.stringify(parsedRecipe).includes(']]');
        console.log(`- Obsidian References Present: ${hasObsidianRefs ? 'YES - FIX NEEDED' : 'No - Good'}`);
        
        // 2. Check ingredients format
        console.log(`- Ingredients Format: ${Array.isArray(parsedRecipe.ingredients) ? 
          `${parsedRecipe.ingredients.length} ingredients found` : 
          'Invalid ingredients format'}`);
        
        const ingredientsHaveAmounts = parsedRecipe.ingredients.every(ing => 
          ing.amount && ing.amount !== 'as needed');
        console.log(`  - Ingredients have proper amounts: ${ingredientsHaveAmounts ? 'Yes - Good' : 'NO - FIX NEEDED'}`);
        
        // 3. Check cuisine vs type
        console.log(`- Type vs Cuisine: type="${parsedRecipe.type}", cuisine="${parsedRecipe.cuisine}"`);
        if (parsedRecipe.type === parsedRecipe.cuisine) {
          console.log(`  - Using type as cuisine: Yes`);
        }
      } else {
        console.log(`ERROR: Failed to parse recipe file: ${file}`);
      }
    }
    
    console.log(`\n============================================`);
    console.log("✅ Test import completed!");
    
  } catch (error) {
    console.error("❌ Error testing import:", error);
    process.exit(1);
  }
}

// Check if directory path is provided as command line argument
const directoryPath = process.argv[2] || 'recipes';
testImport(directoryPath);