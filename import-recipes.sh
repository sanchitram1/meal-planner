#!/bin/bash

echo "========================================"
echo "🔄 Recipe Importer for Meal Planner App"
echo "========================================"
echo

# Check if the recipes directory exists
RECIPE_DIR=${1:-recipes}

if [ ! -d "$RECIPE_DIR" ]; then
  echo "❌ Error: Directory '$RECIPE_DIR' not found."
  echo "Usage: $0 [recipe_directory]"
  echo "Example: $0 recipes"
  exit 1
fi

# Check if we have recipes in the directory
RECIPE_COUNT=$(find "$RECIPE_DIR" -name "*.md" | wc -l)

if [ "$RECIPE_COUNT" -eq 0 ]; then
  echo "❌ No recipe files (*.md) found in directory: $RECIPE_DIR"
  exit 1
fi

echo "📋 Found $RECIPE_COUNT recipe files in $RECIPE_DIR"
echo

# Check if db exists
echo "🔍 Checking database connection..."
npx drizzle-kit generate

# Push schema changes
echo "🔄 Pushing schema changes to database..."
npm run db:push || { echo "❌ Failed to push schema changes"; exit 1; }

# Run the import script
echo "📥 Starting recipe import..."
npx tsx scripts/importRecipes.ts "$RECIPE_DIR"

echo 
echo "✅ Recipe import process complete!"
echo

# Show imported recipes
echo "📊 Displaying imported recipes:"
echo "---------------------------------------"
npx tsx -e "
  import { drizzle } from 'drizzle-orm/neon-serverless';
  import { Pool } from '@neondatabase/serverless';
  import { recipes } from './shared/schema';

  async function showRecipes() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const allRecipes = await db.select({
      id: recipes.id,
      title: recipes.title,
      type: recipes.type,
      cuisine: recipes.cuisine,
      tags: recipes.tags
    })
    .from(recipes)
    .orderBy(recipes.title);
    
    console.table(allRecipes.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      cuisine: r.cuisine,
      tags: r.tags.join(', ')
    })));
    
    await pool.end();
  }
  
  showRecipes();
"
echo "---------------------------------------"
echo

echo "🎉 Your recipes are now available in the app. Enjoy your meal planning!"