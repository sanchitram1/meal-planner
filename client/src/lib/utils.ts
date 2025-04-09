import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GroceryList, Recipe, GroceryCategory } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get day of the week starting from today
export function getDayName(index: number): string {
  const today = new Date();
  const date = new Date(today);
  date.setDate(today.getDate() + index);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Helper function to get formatted date for a day index
export function getDayDate(index: number): string {
  const today = new Date();
  
  // Simply add the index to today to get the future date
  const date = new Date(today);
  date.setDate(today.getDate() + index);
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to extract all recipe IDs from a meal plan
export function extractRecipeIdsFromMealPlan(mealPlan: Array<{breakfast: Recipe, lunch: Recipe, dinner: Recipe}>): number[] {
  const ids: number[] = [];
  const seen: Record<number, boolean> = {};
  
  mealPlan.forEach(day => {
    if (day.breakfast?.id && !seen[day.breakfast.id]) {
      seen[day.breakfast.id] = true;
      ids.push(day.breakfast.id);
    }
    if (day.lunch?.id && !seen[day.lunch.id]) {
      seen[day.lunch.id] = true;
      ids.push(day.lunch.id);
    }
    if (day.dinner?.id && !seen[day.dinner.id]) {
      seen[day.dinner.id] = true;
      ids.push(day.dinner.id);
    }
  });
  
  return ids;
}

// Helper function to format grocery list for export/sharing
export function formatGroceryListForExport(groceryList: GroceryList): string {
  let text = "Weekly Grocery List\n\n";
  
  const categories: { [key in GroceryCategory]: string } = {
    produce: "PRODUCE",
    dairy: "DAIRY",
    proteins: "PROTEINS",
    pantry: "PANTRY & GRAINS",
    other: "OTHER ITEMS"
  };
  
  Object.entries(categories).forEach(([category, title]) => {
    const items = groceryList[category as GroceryCategory];
    if (Object.keys(items).length > 0) {
      text += `${title}\n`;
      Object.values(items).forEach(item => {
        text += `- ${item.name}: ${item.amount}\n`;
      });
      text += "\n";
    }
  });
  
  return text;
}

// Helper function to copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Helper function to share text via Web Share API
export async function shareText(title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text
      });
      return true;
    } catch (err) {
      console.error('Error sharing: ', err);
      return false;
    }
  }
  return false;
}
