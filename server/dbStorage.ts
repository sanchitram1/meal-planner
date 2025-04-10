import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { type Recipe, type Ingredient, type GroceryList, GroceryCategory } from "@shared/schema";
import { recipes as recipesTable, mealPlans as mealPlansTable } from "@shared/schema";
import { eq, or, and, SQL, sql as drizzleSql } from 'drizzle-orm';
import { IStorage } from './storage';
import { enhanceIngredient, parseAmount, aggregateAmounts, categorizeIngredient } from './ingredientParser';

// Initialize database connection with neon-http driver
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DbStorage implements IStorage {
  
  // Recipe related methods
  async getAllRecipes(): Promise<Recipe[]> {
    const dbRecipes = await db.select().from(recipesTable);
    // Cast to Recipe type with proper ingredients handling
    return dbRecipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      // Use the type field if available, otherwise fallback to cuisine
      type: recipe.type || recipe.cuisine
    }));
  }

  async getRecipesByType(type: string): Promise<Recipe[]> {
    // We'll check multiple fields to support various recipe formats
    let dbRecipes;
    
    // Get all recipes first
    const allRecipes = await db.select().from(recipesTable);
    
    // For breakfast and dinner, check both explicit fields and tags
    if (type === 'breakfast' || type === 'dinner') {
      // Filter recipes where any of the following are true:
      // 1. cuisine matches the type exactly
      // 2. type field matches the type exactly
      // 3. tags contain the type (case-insensitive)
      // 4. content contains the word (for Obsidian recipes with text mentions)
      const matchingRecipes = allRecipes.filter(recipe => {
        // Check if cuisine matches
        if (recipe.cuisine && recipe.cuisine.toLowerCase() === type.toLowerCase()) {
          return true;
        }
        
        // Check if type field matches
        if (recipe.type && recipe.type.toLowerCase() === type.toLowerCase()) {
          return true;
        }
        
        // Check if the tags array contains the type
        if (recipe.tags && recipe.tags.some(tag => tag.toLowerCase() === type.toLowerCase())) {
          return true;
        }
        
        // Check if the content mentions this type prominently
        if (recipe.content && recipe.content.toLowerCase().includes(type.toLowerCase())) {
          // Only count this as a match if the word appears as a whole word 
          // (to avoid matching 'breakfast' in 'breakfast-like')
          const contentLower = recipe.content.toLowerCase();
          const regex = new RegExp(`\\b${type.toLowerCase()}\\b`);
          return regex.test(contentLower);
        }
        
        return false;
      });
      
      dbRecipes = matchingRecipes;
      
      console.log(`Found ${dbRecipes.length} ${type} recipes through various criteria`);
    } else {
      // For other types (like 'South Indian'), check fields with more flexible matching
      const matchingRecipes = allRecipes.filter(recipe => {
        // Check cuisine with exact match
        if (recipe.cuisine && recipe.cuisine.toLowerCase() === type.toLowerCase()) {
          return true;
        }
        
        // Check type with exact match
        if (recipe.type && recipe.type.toLowerCase() === type.toLowerCase()) {
          return true;
        }
        
        // Check tags with partial matches
        if (recipe.tags && recipe.tags.some(tag => {
          return tag.toLowerCase() === type.toLowerCase() || 
                 tag.toLowerCase().includes(type.toLowerCase()) ||
                 type.toLowerCase().includes(tag.toLowerCase());
        })) {
          return true;
        }
        
        return false;
      });
      
      dbRecipes = matchingRecipes;
      console.log(`Found ${dbRecipes.length} ${type} recipes by broader criteria`);
    }
    
    // Cast to Recipe type with proper ingredients handling
    return dbRecipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      type: recipe.type || recipe.cuisine // Use the existing type if available
    }));
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    const results = await db.select().from(recipesTable).where(eq(recipesTable.id, id));
    if (results.length === 0) return undefined;
    
    const recipe = results[0];
    // Cast to Recipe type with proper ingredients handling
    return {
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      type: recipe.type || recipe.cuisine
    };
  }
  
  // Meal planning related methods
  async generateMealPlan(breakfastIds: number[], dinnerIds: number[]): Promise<any> {
    // Fetch all needed recipes first
    const allIds = [...breakfastIds, ...dinnerIds];
    const recipeMap = new Map<number, Recipe>();
    
    // Handle the case where no recipes were selected
    if (allIds.length === 0) {
      return [];
    }
    
    const dbRecipes = await db.select()
      .from(recipesTable)
      .where(inArray(recipesTable.id, allIds));
      
    // Build a map for easy lookup, converting DB records to Recipe objects
    dbRecipes.forEach(dbRecipe => {
      const recipe: Recipe = {
        ...dbRecipe,
        ingredients: dbRecipe.ingredients as unknown as Ingredient[],
        type: dbRecipe.type || dbRecipe.cuisine
      };
      recipeMap.set(dbRecipe.id, recipe);
    });
    
    // Determine number of days based on selection counts
    // We'll still create 7 days but the caller can choose to use fewer
    const maxDays = 7;
    const mealPlan = [];
    
    for (let i = 0; i < maxDays; i++) {
      // Get breakfast for this day (if any)
      const breakfast = breakfastIds.length > 0 && i < breakfastIds.length
        ? recipeMap.get(breakfastIds[i])
        : null;
      
      // Get dinner for this day (if any)
      const dinner = dinnerIds.length > 0 && i < dinnerIds.length
        ? recipeMap.get(dinnerIds[i])
        : null;
      
      // For lunch:
      // - Day 0: leave lunch empty
      // - Other days: use previous day's dinner if available
      let lunch = null;
      if (i > 0 && dinnerIds.length > 0 && i-1 < dinnerIds.length) {
        const prevDinnerIndex = i - 1;
        lunch = recipeMap.get(dinnerIds[prevDinnerIndex]);
      }
      
      mealPlan.push({
        day: i,
        breakfast,
        lunch,
        dinner
      });
    }
    
    return mealPlan;
  }

  async generateGroceryList(recipeIds: number[]): Promise<GroceryList> {
    // Fetch all needed recipes
    const dbRecipes = await db.select()
      .from(recipesTable)
      .where(inArray(recipesTable.id, recipeIds));
    
    // Initialize grocery list
    const groceryList: GroceryList = {
      produce: {},
      dairy: {},
      proteins: {},
      pantry: {},
      other: {}
    };
    
    // Process each recipe's ingredients
    dbRecipes.forEach(dbRecipe => {
      // Convert database recipe to Recipe type
      const ingredients = dbRecipe.ingredients as unknown as Ingredient[];
      
      ingredients.forEach(ingredient => {
        const category = (ingredient.category as GroceryCategory) || 'other';
        
        // Add or update the ingredient in the appropriate category
        if (groceryList[category][ingredient.name]) {
          // If ingredient already exists, we could implement logic to combine quantities
          // For simplicity, we'll just note that it's needed in multiple recipes
          const existing = groceryList[category][ingredient.name];
          groceryList[category][ingredient.name] = {
            ...existing,
            amount: `${existing.amount} + ${ingredient.amount}`
          };
        } else {
          groceryList[category][ingredient.name] = {
            name: ingredient.name,
            amount: ingredient.amount,
            checked: false,
            category
          };
        }
      });
    });
    
    return groceryList;
  }

  // Save meal plan to database
  async saveMealPlan(breakfastIds: number[], dinnerIds: number[], days: number): Promise<any> {
    try {
      // Insert meal plan record
      const result = await db.insert(mealPlansTable).values({
        breakfastIds: breakfastIds.map(id => id.toString()),
        dinnerIds: dinnerIds.map(id => id.toString()),
        days: days
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  }

  // These methods aren't used in the current app but are needed to satisfy the interface
  async getUser(id: number): Promise<any | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return undefined;
  }

  async createUser(user: any): Promise<any> {
    throw new Error("User creation not implemented");
  }
}

// Helper function for SQL IN clause
function inArray(column: any, values: number[]): SQL<unknown> {
  // Handle empty array - return a condition that will always be false
  if (values.length === 0) {
    return drizzleSql`${column} = -1 AND ${column} = -2`; // impossible condition
  }
  
  // Ensure values is treated as an array of separate parameters, not a single string
  return drizzleSql`${column} IN (${drizzleSql.join(values.map(v => drizzleSql`${v}`), drizzleSql`, `)})`;
}