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
      
      // Validate that we have the right number of meals
      if (breakfastIds.length !== 5 || dinnerIds.length !== 5) {
        return res.status(400).json({ 
          error: 'Invalid meal selection', 
          message: 'Please select exactly 5 breakfast and 5 dinner recipes' 
        });
      }
      
      const mealPlan = await dbStorage.generateMealPlan(breakfastIds, dinnerIds);
      res.json(mealPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      res.status(500).json({ error: 'Failed to generate meal plan' });
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
