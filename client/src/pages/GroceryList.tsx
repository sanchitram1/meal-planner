import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Clipboard, Share2, Leaf, Milk, Beef, Home } from "lucide-react";
import { GroceryList as GroceryListType, GroceryCategory, GroceryItem } from "@shared/schema";
import { copyToClipboard, shareText, formatGroceryListForExport } from "@/lib/utils";

type GroceryListProps = {
  groceryList: GroceryListType;
  onViewMealPlan: () => void;
};

export default function GroceryList({ groceryList, onViewMealPlan }: GroceryListProps) {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Get category icon and color
  const getCategoryStyles = (category: GroceryCategory) => {
    switch (category) {
      case 'produce':
        return { icon: <Leaf className="h-5 w-5" />, bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'dairy':
        return { icon: <Milk className="h-5 w-5" />, bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'proteins':
        return { icon: <Beef className="h-5 w-5" />, bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'pantry':
        return { icon: <Home className="h-5 w-5" />, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      default:
        return { icon: <Clipboard className="h-5 w-5" />, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  // Handle checkbox change
  const handleCheckItem = (category: GroceryCategory, itemName: string) => {
    const key = `${category}:${itemName}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Copy grocery list to clipboard
  const handleCopyList = async () => {
    const text = formatGroceryListForExport(groceryList);
    const success = await copyToClipboard(text);
    
    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "Grocery list has been copied to your clipboard.",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Share grocery list
  const handleShareList = async () => {
    const text = formatGroceryListForExport(groceryList);
    const success = await shareText("Weekly Grocery List", text);
    
    if (!success) {
      toast({
        title: "Sharing not supported",
        description: "Your device doesn't support sharing. Try copying the list instead.",
        variant: "destructive"
      });
    }
  };

  // Check if any category is empty
  const hasItems = Object.values(groceryList).some(category => 
    Object.keys(category).length > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Grocery List</h2>
        <div className="mt-3 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={onViewMealPlan}
          >
            View Meal Plan
          </Button>
          <Button
            onClick={handleCopyList}
            className="gap-1"
          >
            <Clipboard className="h-4 w-4" /> Copy List
          </Button>
          <Button
            onClick={handleShareList}
            variant="secondary"
            className="gap-1"
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Grocery List Categories */}
      {!hasItems ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-800">No grocery list has been generated yet. Please create a meal plan first.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onViewMealPlan}
          >
            Create Meal Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(groceryList) as [GroceryCategory, Record<string, GroceryItem>][])
            .filter(([_, items]) => Object.keys(items).length > 0)
            .map(([category, items]) => {
              const { icon, bgColor, textColor } = getCategoryStyles(category as GroceryCategory);
              
              return (
                <Accordion type="single" collapsible className="w-full" key={category} defaultValue={category}>
                  <AccordionItem value={category}>
                    <AccordionTrigger className={`${bgColor} ${textColor} p-3 rounded-lg`}>
                      <div className="flex items-center text-lg font-medium">
                        <span className="mr-2">{icon}</span>
                        <span className="capitalize">{category}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-3 bg-white rounded-lg shadow">
                        <ul className="divide-y divide-gray-200">
                          {Object.values(items).map((item) => {
                            const key = `${category}:${item.name}`;
                            return (
                              <li key={item.name} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center">
                                  <Checkbox
                                    id={key}
                                    checked={!!checkedItems[key]}
                                    onCheckedChange={() => handleCheckItem(category as GroceryCategory, item.name)}
                                  />
                                  <label
                                    htmlFor={key}
                                    className={`ml-3 ${checkedItems[key] ? 'line-through text-gray-400' : 'text-gray-900'}`}
                                  >
                                    {item.name}
                                  </label>
                                </div>
                                <span className="text-sm text-gray-600">{item.amount}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
