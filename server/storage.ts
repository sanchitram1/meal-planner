import { type Recipe, type Ingredient, type GroceryList, GroceryCategory } from "@shared/schema";
import { breakfastRecipes, dinnerRecipes, allRecipes } from "../client/src/data/sampleRecipes";
import fs from 'fs';
import path from 'path';
import { parseRecipeFile, loadRecipesFromDirectory } from './recipeParser';
import { enhanceIngredient, parseAmount, aggregateAmounts, categorizeIngredient } from './ingredientParser';

// Storage interface
export interface IStorage {
  // User management methods (not used currently but kept for interface compatibility)
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Recipe related methods
  getAllRecipes(): Promise<Recipe[]>;
  getRecipesByType(type: string): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;
  
  // Meal planning related methods
  generateMealPlan(breakfastIds: number[], dinnerIds: number[]): Promise<any>;
  generateGroceryList(recipeIds: number[]): Promise<GroceryList>;
  saveMealPlan(breakfastIds: number[], dinnerIds: number[], days: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private recipes: Map<number, Recipe>;
  currentId: number;
  currentRecipeId: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.currentId = 1;
    this.currentRecipeId = 1;
    
    // Load sample recipes into memory with default values for new required fields
    this.loadSampleRecipes();
    
    // Try to load recipes from the recipes directory if it exists
    this.loadRecipesFromDisk();
  }

  private loadSampleRecipes() {
    const currentDate = new Date().toISOString();
    allRecipes.forEach(recipe => {
      // Add required fields for the new schema that might be missing in sample data
      const enrichedRecipe = {
        ...recipe,
        author: recipe.author || "Unknown",
        serves: recipe.serves || 4,
        last: recipe.last || currentDate,
        // Map 'type' to 'cuisine' if cuisine is not provided
        cuisine: recipe.cuisine || recipe.type || "Unknown",
      };
      this.recipes.set(recipe.id || this.currentRecipeId++, enrichedRecipe);
    });
  }

  private loadRecipesFromDisk() {
    try {
      const recipesDir = path.join(process.cwd(), 'recipes');
      if (fs.existsSync(recipesDir)) {
        const recipes = loadRecipesFromDirectory(recipesDir);
        recipes.forEach(recipe => {
          const id = this.currentRecipeId++;
          this.recipes.set(id, { ...recipe, id });
        });
        console.log(`Loaded ${recipes.length} recipes from disk`);
      }
    } catch (error) {
      console.error('Error loading recipes from disk:', error);
    }
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: any): Promise<any> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipesByType(type: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(
      recipe => recipe.type === type
    );
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async generateMealPlan(breakfastIds: number[], dinnerIds: number[]): Promise<any> {
    const breakfasts = breakfastIds.map(id => this.recipes.get(id)).filter(Boolean) as Recipe[];
    const dinners = dinnerIds.map(id => this.recipes.get(id)).filter(Boolean) as Recipe[];
    
    // Handle the case where no recipes were selected
    if (breakfasts.length === 0 && dinners.length === 0) {
      return [];
    }
    
    // Determine number of days based on selection counts
    // We'll still create 7 days but the caller can choose to use fewer
    const maxDays = 7;
    const mealPlan = [];
    
    for (let i = 0; i < maxDays; i++) {
      // Get breakfast for this day (if any)
      const breakfast = breakfasts.length > 0 && i < breakfasts.length
        ? breakfasts[i]
        : null;
      
      // Get dinner for this day (if any)
      const dinner = dinners.length > 0 && i < dinners.length
        ? dinners[i]
        : null;
      
      // For lunch:
      // - Day 0: leave lunch empty
      // - Other days: use previous day's dinner if available
      let lunch = null;
      if (i > 0 && dinners.length > 0 && i-1 < dinners.length) {
        const prevDinnerIndex = i - 1;
        lunch = dinners[prevDinnerIndex];
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
    const recipes = recipeIds
      .map(id => this.recipes.get(id))
      .filter(Boolean) as Recipe[];
    
    // Initialize grocery list
    const groceryList: GroceryList = {
      produce: {},
      dairy: {},
      proteins: {},
      pantry: {},
      other: {}
    };
    
    // Create a map to store ingredient amounts by name and unit for aggregation
    const ingredientAmountsMap: Record<string, Array<ReturnType<typeof parseAmount>>> = {};
    
    // Process each recipe's ingredients
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        // Ensure ingredient has a category, defaulting to categorizeIngredient if not provided
        const category = (ingredient.category as GroceryCategory) || categorizeIngredient(ingredient.name);
        
        // Parse ingredient amount into structured data
        const enhancedIngredient = enhanceIngredient(ingredient);
        const parsedAmount = enhancedIngredient.parsedAmount;
        
        // Create a normalized key for aggregation
        // We combine name and unit (if present) to group similar ingredients
        const unitKey = parsedAmount.unit || 'unspecified';
        const aggregationKey = `${ingredient.name.toLowerCase()}:${unitKey}`;
        
        // Store the parsed amount for later aggregation
        if (!ingredientAmountsMap[aggregationKey]) {
          ingredientAmountsMap[aggregationKey] = [];
        }
        ingredientAmountsMap[aggregationKey].push(parsedAmount);
        
        // If this is the first time we've seen this ingredient,
        // initialize it in the grocery list
        if (!groceryList[category][ingredient.name]) {
          groceryList[category][ingredient.name] = {
            name: ingredient.name,
            amount: ingredient.amount, // Will be updated later
            checked: false,
            category
          };
        }
      });
    });
    
    // Aggregate amounts for each ingredient
    for (const [aggregationKey, amounts] of Object.entries(ingredientAmountsMap)) {
      const [ingredientName, _] = aggregationKey.split(':');
      
      // Find which category this ingredient belongs to
      let ingredientCategory: GroceryCategory | undefined;
      let ingredientFullName: string | undefined;
      
      // Look for the ingredient in all categories
      Object.entries(groceryList).forEach(([category, items]) => {
        Object.keys(items).forEach(itemName => {
          if (itemName.toLowerCase() === ingredientName || 
              itemName.toLowerCase().includes(ingredientName)) {
            ingredientCategory = category as GroceryCategory;
            ingredientFullName = itemName;
          }
        });
      });
      
      if (!ingredientCategory || !ingredientFullName) {
        continue; // Skip if we can't find the ingredient
      }
      
      // Try to aggregate the amounts
      const aggregatedAmount = aggregateAmounts(amounts);
      
      if (aggregatedAmount && aggregatedAmount.quantity !== null) {
        // If we successfully aggregated with a numeric value, use the structured display
        groceryList[ingredientCategory][ingredientFullName].amount = aggregatedAmount.display;
      } else if (amounts.length > 1) {
        // If we couldn't aggregate but have multiple amounts, join them with a plus
        const amountString = amounts.map(a => a.display).join(' + ');
        groceryList[ingredientCategory][ingredientFullName].amount = amountString;
      }
      // If there's only one amount, we already set it initially
    }
    
    return groceryList;
  }
  
  async saveMealPlan(breakfastIds: number[], dinnerIds: number[], days: number): Promise<any> {
    // In-memory storage implementation - this would be persisted to a database in DbStorage
    const mealPlan = {
      id: this.currentId++,
      breakfastIds: breakfastIds.map(id => id.toString()),
      dinnerIds: dinnerIds.map(id => id.toString()),
      days,
      createdAt: new Date()
    };
    
    // Return the created meal plan
    return mealPlan;
  }
}

export const storage = new MemStorage();
