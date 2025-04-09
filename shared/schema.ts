import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define recipe schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  type: text("type").notNull(),
  cuisine: text("cuisine").notNull(),
  author: text("author").notNull(),
  serves: integer("serves").notNull(),
  ingredients: jsonb("ingredients").notNull(),
  rating: integer("rating").notNull(),
  last: timestamp("last").notNull(),
  content: text("content").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  days: integer("days").notNull(),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
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
  type: z.string().optional(), // Kept for backward compatibility
  cuisine: z.string(),
  author: z.string(),
  serves: z.number(),
  ingredients: z.array(ingredientSchema),
  rating: z.number(),
  last: z.date().or(z.string()),
  content: z.string(),
  tags: z.array(z.string()),
});

// Types
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
