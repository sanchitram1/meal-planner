import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { type Recipe, type Ingredient, type GroceryList, GroceryCategory } from "@shared/schema";
import { recipes as recipesTable, mealPlans as mealPlansTable } from "@shared/schema";
import { eq, or, and, SQL, sql as drizzleSql } from 'drizzle-orm';
import { IStorage } from './storage';

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
      // Ensure type is available for backward compatibility
      type: recipe.cuisine
    }));
  }

  async getRecipesByType(type: string): Promise<Recipe[]> {
    // Note: 'type' parameter is mapped to 'cuisine' column
    const dbRecipes = await db.select().from(recipesTable).where(eq(recipesTable.cuisine, type));
    // Cast to Recipe type with proper ingredients handling
    return dbRecipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients as unknown as Ingredient[],
      type: recipe.cuisine
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
      type: recipe.cuisine
    };
  }
  
  // Meal planning related methods
  async generateMealPlan(breakfastIds: number[], dinnerIds: number[]): Promise<any> {
    // Fetch all needed recipes first
    const allIds = [...breakfastIds, ...dinnerIds];
    const recipeMap = new Map<number, Recipe>();
    
    const dbRecipes = await db.select()
      .from(recipesTable)
      .where(inArray(recipesTable.id, allIds));
      
    // Build a map for easy lookup, converting DB records to Recipe objects
    dbRecipes.forEach(dbRecipe => {
      const recipe: Recipe = {
        ...dbRecipe,
        ingredients: dbRecipe.ingredients as unknown as Ingredient[],
        type: dbRecipe.cuisine
      };
      recipeMap.set(dbRecipe.id, recipe);
    });
    
    // Create a 7-day meal plan (Monday to Sunday)
    const mealPlan = [];
    for (let i = 0; i < 7; i++) {
      const breakfastId = breakfastIds[i % breakfastIds.length];
      const dinnerId = dinnerIds[i % dinnerIds.length];
      
      const breakfast = recipeMap.get(breakfastId);
      const dinner = recipeMap.get(dinnerId);
      
      // For lunch:
      // - Monday (day 0): leave lunch empty
      // - Other days: use previous day's dinner
      const lunch = i === 0 
        ? null // Monday has no lunch
        : recipeMap.get(dinnerIds[(i - 1) % dinnerIds.length]);
      
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
  
  // For a single value, just use equals
  if (values.length === 1) {
    return eq(column, values[0]);
  }
  
  // For multiple values, construct OR conditions manually
  let condition = eq(column, values[0]);
  for (let i = 1; i < values.length; i++) {
    condition = or(condition, eq(column, values[i]));
  }
  return condition;
}