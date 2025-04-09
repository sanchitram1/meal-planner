import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema is kept as it might be needed in future
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define recipe schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  type: text("type").notNull(), // breakfast, lunch, dinner, etc.
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  calories: integer("calories"),
  cuisine: text("cuisine"),
  content: text("content").notNull(), // The full markdown content
  ingredients: jsonb("ingredients").notNull(),
  tags: text("tags").array().notNull(),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

// Define meal plan schema
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  breakfastIds: text("breakfast_ids").array().notNull(),
  dinnerIds: text("dinner_ids").array().notNull(),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
});

// Define ingredient schema
export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  category: z.string().optional(),
});

// Define recipe interface
export const recipeSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  fileName: z.string(),
  type: z.string(),
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  servings: z.number().optional(),
  calories: z.number().optional(),
  cuisine: z.string().optional(),
  content: z.string(),
  ingredients: z.array(ingredientSchema),
  tags: z.array(z.string()),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Recipe = z.infer<typeof recipeSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type Ingredient = z.infer<typeof ingredientSchema>;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;

// Define a grocery list category type
export type GroceryCategory = "produce" | "dairy" | "proteins" | "pantry" | "other";

// Define a grocery list item type
export type GroceryItem = {
  name: string;
  amount: string;
  checked: boolean;
  category: GroceryCategory;
};

// Define a grocery list type
export type GroceryList = {
  [key in GroceryCategory]: Record<string, GroceryItem>;
};
