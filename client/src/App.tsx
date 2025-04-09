import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MealPlan from "@/pages/MealPlan";
import GroceryList from "@/pages/GroceryList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GroceryList as GroceryListType } from "@shared/schema";
import { extractRecipeIdsFromMealPlan } from "@/lib/utils";

function App() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'select' | 'planner' | 'grocery'>('select');
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryListType>({
    produce: {},
    dairy: {},
    proteins: {},
    pantry: {},
    other: {}
  });

  // Function to generate meal plan
  const handleGeneratePlan = async (breakfastIds: number[], dinnerIds: number[]) => {
    try {
      const response = await apiRequest('POST', '/api/mealplan', { breakfastIds, dinnerIds });
      const data = await response.json();
      setMealPlan(data);
      
      // Generate grocery list automatically
      const allRecipeIds = extractRecipeIdsFromMealPlan(data);
      generateGroceryList(allRecipeIds);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to generate grocery list
  const generateGroceryList = async (recipeIds: number[]) => {
    try {
      const response = await apiRequest('POST', '/api/grocerylist', { recipeIds });
      const data = await response.json();
      setGroceryList(data);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to generate grocery list. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to handle view changes
  const handleViewChange = (view: 'select' | 'planner' | 'grocery') => {
    setCurrentView(view);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header currentView={currentView} onViewChange={handleViewChange} />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'select' && (
            <Home 
              onGeneratePlan={handleGeneratePlan} 
              setCurrentView={setCurrentView} 
            />
          )}
          
          {currentView === 'planner' && (
            <MealPlan 
              mealPlan={mealPlan} 
              onGoBack={() => setCurrentView('select')}
              onViewGroceryList={() => setCurrentView('grocery')}
            />
          )}
          
          {currentView === 'grocery' && (
            <GroceryList 
              groceryList={groceryList}
              onViewMealPlan={() => setCurrentView('planner')}
            />
          )}
        </main>
        
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
