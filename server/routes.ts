import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DbStorage } from "./dbStorage";
import { z } from "zod";

// Initialize database storage 
const dbStorage = new DbStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API endpoint to get all recipes
  app.get('/api/recipes', async (req, res) => {
    try {
      const recipes = await dbStorage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  });
  
  // API endpoint to get recipes by type (breakfast, dinner, etc.)
  app.get('/api/recipes/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const recipes = await dbStorage.getRecipesByType(type);
      res.json(recipes);
    } catch (error) {
      console.error(`Error fetching ${req.params.type} recipes:`, error);
      res.status(500).json({ error: `Failed to fetch ${req.params.type} recipes` });
    }
  });
  
  // API endpoint to get a specific recipe by ID
  app.get('/api/recipe/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid recipe ID' });
      }
      
      const recipe = await dbStorage.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  });
  
  // API endpoint to generate a meal plan
  app.post('/api/mealplan', async (req, res) => {
    try {
      const schema = z.object({
        breakfastIds: z.array(z.number()),
        dinnerIds: z.array(z.number())
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid meal plan data', details: result.error });
      }
      
      const { breakfastIds, dinnerIds } = result.data;
      
      // No longer enforcing exactly 5 of each recipe - can have variable numbers
      if (breakfastIds.length === 0 && dinnerIds.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid meal selection', 
          message: 'Please select at least one recipe' 
        });
      }
      
      // Number of days to plan for is the maximum of breakfast and dinner selections
      const days = Math.max(breakfastIds.length, dinnerIds.length);
      
      const mealPlan = await dbStorage.generateMealPlan(breakfastIds, dinnerIds);
      
      // Only include the days we need based on selection count
      const limitedMealPlan = mealPlan.slice(0, days);
      
      res.json(limitedMealPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      res.status(500).json({ error: 'Failed to generate meal plan' });
    }
  });
  
  // API endpoint to save a meal plan
  app.post('/api/mealplan/save', async (req, res) => {
    try {
      const schema = z.object({
        breakfastIds: z.array(z.number()),
        dinnerIds: z.array(z.number()),
        days: z.number().positive()
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid meal plan data', details: result.error });
      }
      
      const { breakfastIds, dinnerIds, days } = result.data;
      
      const savedMealPlan = await dbStorage.saveMealPlan(breakfastIds, dinnerIds, days);
      res.json(savedMealPlan);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      res.status(500).json({ error: 'Failed to save meal plan' });
    }
  });
  
  // API endpoint to generate a grocery list
  app.post('/api/grocerylist', async (req, res) => {
    try {
      const schema = z.object({
        recipeIds: z.array(z.number())
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid grocery list data', details: result.error });
      }
      
      const { recipeIds } = result.data;
      const groceryList = await dbStorage.generateGroceryList(recipeIds);
      res.json(groceryList);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      res.status(500).json({ error: 'Failed to generate grocery list' });
    }
  });

  return httpServer;
}
