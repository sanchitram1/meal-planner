import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SquareMenu } from "lucide-react";

type HeaderProps = {
  currentView: 'select' | 'planner' | 'grocery';
  onViewChange: (view: 'select' | 'planner' | 'grocery') => void;
};

export function Header({ currentView, onViewChange }: HeaderProps) {
  const [location, setLocation] = useLocation();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <SquareMenu className="text-primary h-6 w-6 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900">MealMinder</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant={currentView === 'planner' ? 'default' : 'outline'}
            onClick={() => onViewChange('planner')}
            className="text-sm"
          >
            Meal Planner
          </Button>
          <Button
            variant={currentView === 'grocery' ? 'default' : 'outline'}
            onClick={() => onViewChange('grocery')}
            className="text-sm"
          >
            Grocery List
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
