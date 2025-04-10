import { Ingredient, GroceryCategory } from '@shared/schema';

/**
 * Enhanced Ingredient Parser
 * 
 * This file contains utilities for parsing, standardizing, and managing ingredients
 * in a more structured way. It enables better handling of ingredient amounts,
 * units, and aggregation for grocery lists.
 * 
 * TODO: If migrating to a dedicated ingredients table in the future:
 * - Create tables for ingredients and recipe_ingredients
 * - Update these utilities to work with the new relational structure
 * - Implement a migration script to convert existing jsonb data to the new structure
 */

// Common units of measurement with their abbreviations and conversions
export const UNITS = {
  // Volume
  TEASPOON: ['tsp', 'teaspoon', 'teaspoons'],
  TABLESPOON: ['tbsp', 'tbs', 'tablespoon', 'tablespoons'],
  CUP: ['cup', 'cups', 'c'],
  FLUID_OUNCE: ['fl oz', 'fluid ounce', 'fluid ounces'],
  PINT: ['pt', 'pint', 'pints'],
  QUART: ['qt', 'quart', 'quarts'],
  GALLON: ['gal', 'gallon', 'gallons'],
  MILLILITER: ['ml', 'milliliter', 'milliliters'],
  LITER: ['l', 'liter', 'liters'],
  
  // Weight
  OUNCE: ['oz', 'ounce', 'ounces'],
  POUND: ['lb', 'lbs', 'pound', 'pounds'],
  GRAM: ['g', 'gram', 'grams'],
  KILOGRAM: ['kg', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  
  // Count
  PIECE: ['piece', 'pieces', 'pc', 'pcs'],
  WHOLE: ['whole'],
  BUNCH: ['bunch', 'bunches'],
  CLOVE: ['clove', 'cloves'],
  
  // Other
  PINCH: ['pinch', 'pinches'],
  DASH: ['dash', 'dashes'],
  TO_TASTE: ['to taste', 'as needed', 'as required'],
  HANDFUL: ['handful', 'handfuls']
};

// Convert unit name to standardized format
export function standardizeUnit(unitText: string): string | null {
  const lowerUnit = unitText.toLowerCase().trim();
  
  for (const [standardUnit, variations] of Object.entries(UNITS)) {
    if (variations.includes(lowerUnit)) {
      return standardUnit;
    }
  }
  
  return null;
}

/**
 * Parse an amount string into a structured object with numeric quantity and standardized unit
 * 
 * @param amountStr The ingredient amount string to parse
 * @returns An object containing parsed quantity and unit information
 */
export function parseAmount(amountStr: string): {
  rawAmount: string;
  quantity: number | null;
  unit: string | null;
  isRange: boolean;
  display: string;
} {
  // Default return structure
  const result = {
    rawAmount: amountStr.trim(),
    quantity: null as number | null,
    unit: null as string | null,
    isRange: false,
    display: amountStr.trim()
  };
  
  // Handle special cases first
  if (!amountStr || 
      amountStr.toLowerCase().includes('to taste') || 
      amountStr.toLowerCase().includes('as needed')) {
    result.unit = 'TO_TASTE';
    return result;
  }
  
  // Extract numeric values, handling fractions and ranges
  const numericPattern = /(\d+\/\d+|\d+\.\d+|\d+)(?:\s*-\s*(\d+\/\d+|\d+\.\d+|\d+))?/g;
  
  // Manually collect matches instead of using matchAll for compatibility
  const numericMatches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = numericPattern.exec(amountStr)) !== null) {
    numericMatches.push(match);
  }
  
  if (numericMatches.length > 0) {
    const firstMatch = numericMatches[0];
    const firstValue = firstMatch[1];
    
    // Parse the first value, handling fractions
    if (firstValue.includes('/')) {
      const [numerator, denominator] = firstValue.split('/').map(Number);
      result.quantity = numerator / denominator;
    } else {
      result.quantity = parseFloat(firstValue);
    }
    
    // Check if it's a range
    if (firstMatch[2]) {
      result.isRange = true;
      // For ranges, we use the maximum value for quantity calculations
      const secondValue = firstMatch[2];
      let secondQuantity: number;
      
      if (secondValue.includes('/')) {
        const [numerator, denominator] = secondValue.split('/').map(Number);
        secondQuantity = numerator / denominator;
      } else {
        secondQuantity = parseFloat(secondValue);
      }
      
      // Use the larger value for calculations
      if (secondQuantity > result.quantity) {
        result.quantity = secondQuantity;
      }
    }
    
    // Extract the unit by removing the numeric part
    const unitPart = amountStr.replace(numericPattern, '').trim();
    if (unitPart) {
      result.unit = standardizeUnit(unitPart);
    }
    
    // Generate a clean display format
    result.display = amountStr.trim();
  }
  
  return result;
}

/**
 * Attempts to aggregate multiple ingredient amounts into a single measurement
 * 
 * @param amounts Array of parsed amount objects
 * @returns Aggregated amount object or null if aggregation not possible
 */
export function aggregateAmounts(amounts: Array<ReturnType<typeof parseAmount>>): ReturnType<typeof parseAmount> | null {
  // Filter out null quantities and non-matching units
  const validAmounts = amounts.filter(a => a.quantity !== null);
  
  if (validAmounts.length === 0) {
    return null;
  }
  
  // If all have the same unit (or null unit), we can add quantities
  const firstUnit = validAmounts[0].unit;
  const allSameUnit = validAmounts.every(a => a.unit === firstUnit);
  
  if (allSameUnit) {
    const totalQuantity = validAmounts.reduce((sum, curr) => sum + (curr.quantity || 0), 0);
    
    // Format the display based on the unit
    let displayUnit = '';
    if (firstUnit) {
      // Get the first variation of the standardized unit for display
      const unitVariations = Object.entries(UNITS).find(([key]) => key === firstUnit);
      if (unitVariations) {
        displayUnit = unitVariations[1][0]; // Use the first variation
      }
    }
    
    return {
      rawAmount: `${totalQuantity} ${displayUnit}`.trim(),
      quantity: totalQuantity,
      unit: firstUnit,
      isRange: false,
      display: `${totalQuantity} ${displayUnit}`.trim()
    };
  }
  
  // If units don't match, we can't aggregate
  return null;
}

/**
 * Enhanced ingredient processing to extract structured data
 * 
 * @param ingredient Original ingredient object
 * @returns Enhanced ingredient with parsed amount data
 */
export function enhanceIngredient(ingredient: Ingredient): Ingredient & {
  parsedAmount: ReturnType<typeof parseAmount>;
} {
  const parsedAmount = parseAmount(ingredient.amount);
  
  return {
    ...ingredient,
    parsedAmount
  };
}

/**
 * Categorize an ingredient based on its name
 * 
 * @param name Ingredient name to categorize
 * @returns The category for the ingredient
 */
export function categorizeIngredient(name: string): GroceryCategory {
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