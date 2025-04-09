import { users, type User, type InsertUser, type Recipe, type Ingredient, type GroceryList, GroceryCategory } from "@shared/schema";
import { breakfastRecipes, dinnerRecipes, allRecipes } from "../client/src/data/sampleRecipes";
import fs from 'fs';
import path from 'path';
import { parseRecipeFile, loadRecipesFromDirectory } from './recipeParser';

// modify the interface with any CRUD methods you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe related methods
  getAllRecipes(): Promise<Recipe[]>;
  getRecipesByType(type: string): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;
  
  // Meal planning related methods
  generateMealPlan(breakfastIds: number[], dinnerIds: number[]): Promise<any>;
  generateGroceryList(recipeIds: number[]): Promise<GroceryList>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  currentId: number;
  currentRecipeId: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.currentId = 1;
    this.currentRecipeId = 1;
    
    // Load sample recipes into memory
    this.loadSampleRecipes();
    
    // Try to load recipes from the recipes directory if it exists
    this.loadRecipesFromDisk();
  }

  private loadSampleRecipes() {
    allRecipes.forEach(recipe => {
      this.recipes.set(recipe.id || this.currentRecipeId++, recipe);
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

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    
    // Create a 7-day meal plan
    const mealPlan = [];
    for (let i = 0; i < 7; i++) {
      const breakfast = breakfasts[i % breakfasts.length];
      const dinner = dinners[i % dinners.length];
      
      // For lunch, use previous day's dinner (for Monday, use Sunday's dinner)
      const lunch = i > 0 
        ? dinners[(i - 1) % dinners.length] 
        : dinners[dinners.length - 1];
      
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
    
    // Process each recipe's ingredients
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
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
}

export const storage = new MemStorage();
