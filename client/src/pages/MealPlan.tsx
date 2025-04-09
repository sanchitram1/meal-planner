import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@shared/schema";
import { getDayName, getDayDate } from "@/lib/utils";
import { SunIcon, SunsetIcon, MoonIcon, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type MealPlanProps = {
  mealPlan: Array<{
    day: number;
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
  }>;
  onGoBack: () => void;
  onViewGroceryList: () => void;
};

export default function MealPlan({ mealPlan, onGoBack, onViewGroceryList }: MealPlanProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  
  // Check if we have a valid meal plan
  const hasMealPlan = mealPlan && mealPlan.length > 0;
  
  // Function to save the meal plan
  const handleSavePlan = async () => {
    if (!hasMealPlan) return;
    
    try {
      setIsLoading(true);
      
      // Extract breakfast and dinner IDs
      const breakfastIds = mealPlan.map(day => day.breakfast?.id).filter(Boolean) as number[];
      const dinnerIds = mealPlan.map(day => day.dinner?.id).filter(Boolean) as number[];
      
      // Use the number of days in the meal plan
      const days = mealPlan.length;
      
      const response = await apiRequest(
        'POST', 
        '/api/mealplan/save', 
        { breakfastIds, dinnerIds, days }
      );
      
      if (response.ok) {
        setPlanSaved(true);
        toast({
          title: "Plan Saved",
          description: "Your meal plan has been saved successfully.",
          variant: "default"
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Meal Plan for {hasMealPlan ? mealPlan.length : 0} Day{hasMealPlan && mealPlan.length !== 1 ? 's' : ''}
        </h2>
        <div className="mt-3 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={onGoBack}
          >
            Edit Selection
          </Button>
          <Button
            onClick={onViewGroceryList}
            variant="secondary"
          >
            View Grocery List
          </Button>
          {hasMealPlan && (
            <Button
              onClick={handleSavePlan}
              disabled={isLoading || planSaved}
              className="gap-1"
            >
              {isLoading ? "Saving..." : planSaved ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Saved
                </>
              ) : (
                "Confirm Plan"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Weekly Meal Plan Table */}
      {!hasMealPlan ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-800">No meal plan has been generated yet. Please select recipes and generate a plan.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onGoBack}
          >
            Select Recipes
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[120px]">Day</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <SunIcon className="mr-1 h-4 w-4 text-amber-500" />
                    Breakfast
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <SunsetIcon className="mr-1 h-4 w-4 text-orange-500" />
                    Lunch
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <MoonIcon className="mr-1 h-4 w-4 text-indigo-500" />
                    Dinner
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealPlan.map((day, index) => (
                <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{getDayName(day.day)}</span>
                      <span className="text-xs text-gray-500">{getDayDate(day.day)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {day.breakfast && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                        <span>{day.breakfast.title}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {day.lunch ? (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>{day.lunch.title}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No lunch</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {day.dinner && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                        <span>{day.dinner.title}</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
