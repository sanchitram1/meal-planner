import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GroceryList, Recipe, GroceryCategory } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get day of the week
export function getDayName(index: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[index % days.length];
}

// Helper function to get formatted date for a day index
export function getDayDate(index: number): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate the days to add to get to Monday (index 0)
  // If today is Sunday (dayOfWeek 0), add 1 day to get to Monday
  // If today is Monday (dayOfWeek 1), add 0 days
  // If today is Tuesday (dayOfWeek 2), add 6 days to get to next Monday
  let daysToAdd = 1 - dayOfWeek; // Days to add to get to Monday
  if (daysToAdd > 0) daysToAdd -= 7; // If positive, go to previous Monday
  
  // Add the index for the specific day in the week
  daysToAdd += index;
  
  const date = new Date(today);
  date.setDate(today.getDate() + daysToAdd);
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to extract all recipe IDs from a meal plan
export function extractRecipeIdsFromMealPlan(mealPlan: Array<{breakfast: Recipe, lunch: Recipe, dinner: Recipe}>): number[] {
  const ids: number[] = [];
  
  mealPlan.forEach(day => {
    if (day.breakfast?.id) ids.push(day.breakfast.id);
    if (day.lunch?.id) ids.push(day.lunch.id);
    if (day.dinner?.id) ids.push(day.dinner.id);
  });
  
  // Remove duplicates
  return [...new Set(ids)];
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
