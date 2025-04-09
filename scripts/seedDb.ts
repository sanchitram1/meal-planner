import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { recipes as recipesTable } from '../shared/schema';
import { allRecipes } from '../client/src/data/sampleRecipes';

// Initialize database connection with neon-http driver
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

/**
 * Seed the database with sample recipes
 */
async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Format sample recipes to match the database schema
    const formattedRecipes = allRecipes.map(recipe => ({
      title: recipe.title,
      fileName: recipe.fileName,
      cuisine: recipe.cuisine || recipe.type, // Maps type to cuisine
      author: "Default Author", // Adding required fields that might be missing
      serves: 4, // Default value
      ingredients: recipe.ingredients,
      rating: recipe.rating,
      last: new Date(), // Current date
      content: recipe.content, 
      tags: recipe.tags
    }));
    
    // Insert recipes into database
    console.log(`Inserting ${formattedRecipes.length} recipes...`);
    await db.insert(recipesTable).values(formattedRecipes);
    
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();