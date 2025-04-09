import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@shared/schema";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/RecipeCard";
import { SunIcon, MoonIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type HomeProps = {
  onGeneratePlan: (breakfastIds: number[], dinnerIds: number[]) => void;
  setCurrentView: (view: 'select' | 'planner' | 'grocery') => void;
};

export default function Home({ onGeneratePlan, setCurrentView }: HomeProps) {
  const { toast } = useToast();
  const [selectedBreakfasts, setSelectedBreakfasts] = useState<Recipe[]>([]);
  const [selectedDinners, setSelectedDinners] = useState<Recipe[]>([]);

  // Fetch breakfast recipes
  const { 
    data: breakfastRecipes = [] as Recipe[],
    isLoading: isLoadingBreakfasts,
    error: breakfastError
  } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes/breakfast'],
  });

  // Fetch dinner recipes
  const { 
    data: dinnerRecipes = [] as Recipe[],
    isLoading: isLoadingDinners,
    error: dinnerError
  } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes/dinner'],
  });

  useEffect(() => {
    if (breakfastError) {
      toast({
        title: "Error loading breakfast recipes",
        description: (breakfastError as Error).message,
        variant: "destructive"
      });
    }
    if (dinnerError) {
      toast({
        title: "Error loading dinner recipes",
        description: (dinnerError as Error).message,
        variant: "destructive"
      });
    }
  }, [breakfastError, dinnerError, toast]);

  // Toggle breakfast selection
  const toggleBreakfastSelection = (recipe: Recipe) => {
    setSelectedBreakfasts(prev => {
      const isSelected = prev.some(r => r.id === recipe.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipe.id);
      } else if (prev.length < 5) {
        return [...prev, recipe];
      } else {
        toast({
          title: "Selection limit reached",
          description: "You can only select 5 breakfast recipes.",
          variant: "default"
        });
        return prev;
      }
    });
  };

  // Toggle dinner selection
  const toggleDinnerSelection = (recipe: Recipe) => {
    setSelectedDinners(prev => {
      const isSelected = prev.some(r => r.id === recipe.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipe.id);
      } else if (prev.length < 5) {
        return [...prev, recipe];
      } else {
        toast({
          title: "Selection limit reached",
          description: "You can only select 5 dinner recipes.",
          variant: "default"
        });
        return prev;
      }
    });
  };

  // Handle generate meal plan
  const handleGeneratePlan = async () => {
    if (selectedBreakfasts.length !== 5 || selectedDinners.length !== 5) {
      toast({
        title: "Incomplete selection",
        description: "Please select exactly 5 breakfast and 5 dinner recipes.",
        variant: "destructive"
      });
      return;
    }

    const breakfastIds = selectedBreakfasts.map(r => r.id!);
    const dinnerIds = selectedDinners.map(r => r.id!);
    onGeneratePlan(breakfastIds, dinnerIds);
    setCurrentView('planner');
  };

  // Check if a recipe is selected and get its selection order number
  const getBreakfastSelectionNumber = (recipe: Recipe): number | undefined => {
    const index = selectedBreakfasts.findIndex(r => r.id === recipe.id);
    return index !== -1 ? index + 1 : undefined;
  };
  
  const getDinnerSelectionNumber = (recipe: Recipe): number | undefined => {
    const index = selectedDinners.findIndex(r => r.id === recipe.id);
    return index !== -1 ? index + 1 : undefined;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Select Your Recipes</h2>
        <div className="mt-3 sm:mt-0 flex space-x-3 items-center">
          <div className="text-sm text-gray-500">
            Selected: <span className="font-medium">{selectedBreakfasts.length}/5 Breakfasts, {selectedDinners.length}/5 Dinners</span>
          </div>
          <Button
            onClick={handleGeneratePlan}
            disabled={selectedBreakfasts.length !== 5 || selectedDinners.length !== 5}
            className="transition"
          >
            Generate Plan
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> The order you select recipes will determine their placement in your weekly meal plan. 
          The numbers shown on selected recipes indicate their order in the week (1-5).
        </p>
      </div>

      {/* Breakfast Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <SunIcon className="mr-2 h-5 w-5 text-amber-500" />
          Breakfast Recipes
        </h3>
        {isLoadingBreakfasts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakfastRecipes.map((recipe: Recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSelected={getBreakfastSelectionNumber(recipe) !== undefined}
                selectionNumber={getBreakfastSelectionNumber(recipe)}
                onClick={() => toggleBreakfastSelection(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dinner Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <MoonIcon className="mr-2 h-5 w-5 text-indigo-500" />
          Dinner Recipes
        </h3>
        {isLoadingDinners ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dinnerRecipes.map((recipe: Recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSelected={getDinnerSelectionNumber(recipe) !== undefined}
                selectionNumber={getDinnerSelectionNumber(recipe)}
                onClick={() => toggleDinnerSelection(recipe)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
