import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, Calendar, ShoppingBasket } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type HeaderProps = {
  currentView: 'select' | 'planner' | 'grocery';
  onViewChange: (view: 'select' | 'planner' | 'grocery') => void;
};

export function Header({ currentView, onViewChange }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewChange('select')}
            className={`text-gray-900 ${currentView === 'select' ? 'bg-gray-100' : ''}`}
          >
            <Home className="text-primary h-5 w-5" />
            <span className="ml-1.5 font-semibold">Meal Prep</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isMobile ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('planner')}
                className={`p-2 ${currentView === 'planner' ? 'bg-gray-100' : ''}`}
                aria-label="Meal Planner"
              >
                <Calendar className={`h-5 w-5 ${currentView === 'planner' ? 'text-primary' : 'text-gray-600'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('grocery')}
                className={`p-2 ${currentView === 'grocery' ? 'bg-gray-100' : ''}`}
                aria-label="Grocery List"
              >
                <ShoppingBasket className={`h-5 w-5 ${currentView === 'grocery' ? 'text-primary' : 'text-gray-600'}`} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={currentView === 'planner' ? 'default' : 'outline'}
                onClick={() => onViewChange('planner')}
                className="text-sm gap-1.5"
                size="sm"
              >
                <Calendar className="h-4 w-4" />
                Meal Planner
              </Button>
              <Button
                variant={currentView === 'grocery' ? 'default' : 'outline'}
                onClick={() => onViewChange('grocery')}
                className="text-sm gap-1.5"
                size="sm"
              >
                <ShoppingBasket className="h-4 w-4" />
                Grocery List
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
