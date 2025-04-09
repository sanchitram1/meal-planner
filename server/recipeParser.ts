import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Recipe, Ingredient, recipeSchema } from '@shared/schema';

/**
 * Parses a markdown file with YAML frontmatter to extract recipe data
 * @param filePath Path to the markdown file
 * @returns Recipe object
 */
export function parseRecipeFile(filePath: string): Recipe | null {
  try {
    // Read the markdown file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse frontmatter using gray-matter
    const { data, content } = matter(fileContent);
    
    // Map ingredients to our schema
    const ingredients = Array.isArray(data.ingredients) 
      ? data.ingredients.map((ing: any) => ({
          name: ing.name || ing.item || ing,
          amount: ing.amount || ing.quantity || 'as needed',
          category: ing.category || categorizeIngredient(ing.name || ing.item || ing),
        }))
      : [];
    
    // Construct recipe object
    const recipe: Recipe = {
      title: data.title || path.basename(filePath, '.md'),
      fileName: path.basename(filePath),
      type: data.type || 'other',
      prepTime: data.prepTime || data.prep_time,
      cookTime: data.cookTime || data.cook_time,
      servings: data.servings,
      serves: data.serves,
      calories: data.calories,
      cuisine: Array.isArray(data.type) ? data.type[0]?.replace(/\[\[(.*?)\]\]/, '$1') : typeof data.type === 'string' ? data.type.replace(/\[\[(.*?)\]\]/, '$1') : data.cuisine,
      author: Array.isArray(data.author) ? data.author[0]?.replace(/\[\[(.*?)\]\]/, '$1') : typeof data.author === 'string' ? data.author.replace(/\[\[(.*?)\]\]/, '$1') : undefined,
      rating: data.rating,
      content,
      ingredients,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    };

    // Validate recipe with zod
    const result = recipeSchema.safeParse(recipe);
    
    if (!result.success) {
      console.error(`Error parsing recipe: ${filePath}`, result.error);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error(`Error reading or parsing recipe file: ${filePath}`, error);
    return null;
  }
}

/**
 * Loads all markdown files from a directory and parses them as recipes
 * @param dirPath Path to directory containing markdown files
 * @returns Array of recipe objects
 */
export function loadRecipesFromDirectory(dirPath: string): Recipe[] {
  try {
    // Read all files in the directory
    const files = fs.readdirSync(dirPath);
    
    // Filter for markdown files and parse them
    const recipes = files
      .filter(file => file.endsWith('.md'))
      .map(file => parseRecipeFile(path.join(dirPath, file)))
      .filter((recipe): recipe is Recipe => recipe !== null);
    
    return recipes;
  } catch (error) {
    console.error(`Error loading recipes from directory: ${dirPath}`, error);
    return [];
  }
}

/**
 * Simple function to categorize ingredients based on common food types
 * This can be expanded with a more comprehensive database in a production app
 */
function categorizeIngredient(name: string): string {
  const lowerName = (name || '').toLowerCase();
  
  // Produce
  if (/apple|banana|berry|vegetable|carrot|onion|potato|garlic|pepper|tomato|lettuce|spinach|fruit|lemon|lime|orange|avocado|cilantro|mint|basil|parsley|herb/i.test(lowerName)) {
    return 'produce';
  }
  
  // Dairy
  if (/milk|yogurt|cheese|cream|butter|egg|dairy/i.test(lowerName)) {
    return 'dairy';
  }
  
  // Proteins
  if (/meat|chicken|beef|pork|fish|salmon|tuna|turkey|tofu|bean|lentil|protein/i.test(lowerName)) {
    return 'proteins';
  }
  
  // Pantry/Grains
  if (/flour|rice|pasta|bread|cereal|grain|oil|vinegar|sauce|spice|sugar|salt|pepper|stock|broth|canned|dried|baking/i.test(lowerName)) {
    return 'pantry';
  }
  
  // Default
  return 'other';
}
