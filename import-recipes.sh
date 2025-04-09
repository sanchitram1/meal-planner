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

# Display validation requirements
echo
echo "📋 Recipe validation requirements:"
echo "  • Must have at least one meal type tag (breakfast, lunch, dinner)"
echo "  • Must not contain TODO items (- [ ] TODO)"
echo "  • Already imported files will be skipped"
echo

# Run the import script
echo "📥 Starting recipe import with validation..."
npx tsx scripts/importRecipes.ts "$RECIPE_DIR"

echo 
echo "✅ Recipe import process complete!"
echo

# Show count of recipes in the database
echo "📊 Recipes in database:"
echo "---------------------------------------"
npx tsx -e "
  import { drizzle } from 'drizzle-orm/neon-http';
  import { neon } from '@neondatabase/serverless';
  import { recipes } from './shared/schema';
  import { sql } from 'drizzle-orm';
  
  async function countRecipes() {
    const client = neon(process.env.DATABASE_URL);
    const db = drizzle(client);
    
    const totalCount = await db.select({ count: sql\`count(*)\` }).from(recipes);
    
    const breakfastCount = await db.select({ count: sql\`count(*)\` })
      .from(recipes)
      .where(sql\`'breakfast' = ANY(tags)\`);
      
    const lunchCount = await db.select({ count: sql\`count(*)\` })
      .from(recipes)
      .where(sql\`'lunch' = ANY(tags)\`);
      
    const dinnerCount = await db.select({ count: sql\`count(*)\` })
      .from(recipes)
      .where(sql\`'dinner' = ANY(tags)\`);
    
    console.log(\`Total recipes: \${totalCount[0].count}\`);
    console.log(\`Breakfast recipes: \${breakfastCount[0].count}\`);
    console.log(\`Lunch recipes: \${lunchCount[0].count}\`);
    console.log(\`Dinner recipes: \${dinnerCount[0].count}\`);
  }
  
  countRecipes().catch(console.error);
"
echo "---------------------------------------"
echo

echo "🎉 Your recipes are now available in the app. Enjoy your meal planning!"