import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Recipe, Ingredient, recipeSchema } from '@shared/schema';

/**
 * Helper function to handle Obsidian-style references
 * Converts [[Reference]] to Reference and handles both string and array cases
 */
function cleanObsidianRef(value: any): string {
  if (!value) return '';
  
  // If it's an array, get the first element
  const rawValue = Array.isArray(value) ? value[0] : value;
  
  // Extract the text from inside [[ ]] if present
  if (typeof rawValue === 'string' && rawValue.includes('[[')) {
    return rawValue.replace(/\[\[(.*?)\]\]/g, '$1');
  }
  
  return String(rawValue);
}

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
    
    // Handle Obsidian-specific format for ingredients
    // If markdown content contains an Ingredients section, parse it for better ingredient details
    let enhancedIngredients = ingredients;
    if (ingredients.length > 0 && content.includes('## Ingredients')) {
      try {
        // Extract the ingredients section from the markdown
        const ingredientsSection = content.split('## Ingredients')[1].split('##')[0].trim();
        const ingredientsLines = ingredientsSection.split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.trim().substring(2).trim());
        
        // Match ingredient names with quantities from the content
        enhancedIngredients = ingredients.map((ing, index) => {
          const cleanName = cleanObsidianRef(ing.name);
          
          // Try to find a matching line in the ingredients section - clean it of any Obsidian references first
          const cleanedLines = ingredientsLines.map(line => line.replace(/\[\[(.*?)\]\]/g, '$1'));
          const matchingLine = cleanedLines.find(line => 
            line.toLowerCase().includes(cleanName.toLowerCase()));
          
          if (matchingLine) {
            // Extract quantity/amount if possible
            // Looking for patterns like "4 carrots" or "1 cup milk" or "carrots - boiled"
            
            // First, check for simple patterns like "4 carrots" or "1 cup milk"
            let amountMatch = matchingLine.match(/^([\d\/\.\s]+\s*(?:cup|tablespoon|tbsp|teaspoon|tsp|oz|ounce|g|gram|lb|pound|ml|liter|pinch|dash|handful|piece|clove|bunch|to taste|as needed)?)?\s*(.+)$/i);
            
            // If that didn't work, look for patterns with dashes like "carrots - boiled" or "carrots – boiled"
            if (!amountMatch || !amountMatch[1] || !amountMatch[1].trim()) {
              const dashMatch = matchingLine.match(/^(.+?)(?:\s*[-–—]\s*)(.+)$/);
              if (dashMatch) {
                // Check if the part before the dash is the ingredient and after is a descriptor
                if (dashMatch[1].toLowerCase().includes(cleanName.toLowerCase())) {
                  // If the part before dash contains our ingredient name, use the part after dash as a quantity/descriptor
                  amountMatch = [matchingLine, dashMatch[2], dashMatch[1]];
                }
              }
            }
            
            // For "Tamarind water", extract "water" as the form/amount
            if ((!amountMatch || !amountMatch[1] || !amountMatch[1].trim()) && 
                matchingLine.toLowerCase().includes(cleanName.toLowerCase()) && 
                matchingLine.toLowerCase() !== cleanName.toLowerCase()) {
              // Extract anything after the ingredient name as a possible amount/form descriptor
              const restOfLine = matchingLine.substring(matchingLine.toLowerCase().indexOf(cleanName.toLowerCase()) + cleanName.length).trim();
              if (restOfLine) {
                amountMatch = [matchingLine, restOfLine, cleanName];
              }
            }
            
            if (amountMatch && amountMatch[1] && amountMatch[1].trim()) {
              // Found a quantity/amount
              return {
                name: cleanName,
                amount: amountMatch[1].trim(),
                category: ing.category || categorizeIngredient(cleanName)
              };
            }
          }
          
          // If no better amount found, keep the original
          return {
            name: cleanName,
            amount: ing.amount || 'as needed',
            category: ing.category || categorizeIngredient(cleanName)
          };
        });
      } catch (e) {
        console.warn(`Warning: Could not enhance ingredients for ${filePath}`, e);
        // If something goes wrong, keep the original ingredients
      }
    }
    
    // Get the title from frontmatter or filename
    const title = data.title || path.basename(filePath, '.md').replace(/-/g, ' ');
    
    // Clean type and use it for cuisine if cuisine is not specified
    const cleanedType = cleanObsidianRef(data.type || 'other');
    const cleanedCuisine = cleanObsidianRef(data.cuisine || data.type || 'Other');
    
    // Clean author
    const cleanedAuthor = cleanObsidianRef(data.author || 'Unknown');
    
    // Clean tags - make sure they're all strings without Obsidian references
    let cleanedTags: string[] = [];
    if (Array.isArray(data.tags)) {
      cleanedTags = data.tags.map(tag => cleanObsidianRef(tag));
    } else if (data.tags) {
      cleanedTags = [cleanObsidianRef(data.tags)];
    } else {
      // If no tags, use the cleaned type as a default tag
      cleanedTags = [cleanedType.toLowerCase()];
    }
    
    // For dinner/breakfast classification - add these tags if they appear in the content
    if (content.toLowerCase().includes('dinner') && !cleanedTags.includes('dinner')) {
      cleanedTags.push('dinner');
    }
    if (content.toLowerCase().includes('breakfast') && !cleanedTags.includes('breakfast')) {
      cleanedTags.push('breakfast');
    }
    
    // Clean up content by removing Obsidian references
    const cleanedContent = (data.content || content || '').replace(/\[\[(.*?)\]\]/g, '$1');
    
    // Construct recipe object with all required fields
    const recipe: Recipe = {
      title,
      fileName: path.basename(filePath),
      type: cleanedType,
      serves: data.serves || data.servings || 4,
      cuisine: cleanedCuisine,
      author: cleanedAuthor,
      rating: data.rating || Math.floor(Math.random() * 5) + 3, // Default to a random rating between 3-7 if not provided
      content: cleanedContent,
      ingredients: enhancedIngredients,
      tags: cleanedTags,
      last: data.last ? new Date(data.last) : new Date(), // Use current date if not provided
    };
    
    // Note: We kept the required fields in the schema but can add extra fields if needed in the future

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
  if (/flour|rice|pasta|bread|cereal|grain|oil|vinegar|sauce|spice|sugar|salt|pepper|stock|broth|canned|dried|baking|jaggery|tamarind|tadka/i.test(lowerName)) {
    return 'pantry';
  }
  
  // More specific Indian ingredients
  if (/jaggery|tamarind|garam masala|cumin|coriander|turmeric|masala|curry|ghee|asafoetida|mustard seed|tadka/i.test(lowerName)) {
    return 'pantry';
  }
  
  // Default
  return 'other';
}
