import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  FlameIcon, 
  InfoIcon, 
  User, 
  Utensils
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

type RecipeCardProps = {
  recipe: Recipe;
  isSelected: boolean;
  selectionNumber?: number;
  onClick: () => void;
};

export function RecipeCard({ recipe, isSelected, selectionNumber, onClick }: RecipeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Function to parse and render markdown content sections
  const renderContentSection = (content: string, section: string) => {
    const regex = new RegExp(`## ${section}([\\s\\S]*?)(?=##|$)`, 'i');
    const match = content.match(regex);
    
    if (match && match[1]) {
      return (
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">{section}</h3>
          <div className="whitespace-pre-line text-sm sm:text-base">
            {match[1].trim().split('\n').map((line, i) => (
              <p key={i} className="mb-1">
                {line.startsWith('- ') ? (
                  <span className="flex">
                    <span className="mr-2">•</span>
                    <span>{line.substring(2)}</span>
                  </span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Stop click propagation when clicking the info button
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <>
      <Card 
        onClick={onClick}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md relative",
          isSelected ? "border-primary bg-primary/5" : "border-gray-200"
        )}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <h4 className="text-base sm:text-lg font-medium text-gray-900 pr-4">{recipe.title}</h4>
            <div className="flex items-center">
              <button 
                onClick={handleDetailsClick} 
                className="text-gray-500 hover:text-primary mr-1.5 sm:mr-2"
                aria-label="View recipe details"
              >
                <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div 
                className={cn(
                  "flex-shrink-0 inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary" : "bg-gray-200"
                )}
              >
                {isSelected && (selectionNumber ? (
                  <span className="text-white text-xs font-bold">{selectionNumber}</span>
                ) : (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
            {recipe.cuisine && (
              <Badge variant="secondary" className="text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                {recipe.cuisine}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">{recipe.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            {/* Recipe metadata */}
            <div className="flex flex-wrap gap-2 sm:gap-3 border-b pb-3 sm:pb-4">
              {recipe.cuisine && (
                <div className="flex items-center text-xs sm:text-sm">
                  <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
                  <span>{recipe.cuisine} Cuisine</span>
                </div>
              )}
              
              {recipe.serves && (
                <div className="flex items-center text-xs sm:text-sm">
                  <span>Serves: {recipe.serves}</span>
                </div>
              )}

              {recipe.author && (
                <div className="flex items-center text-xs sm:text-sm">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
                  <span>By: {recipe.author}</span>
                </div>
              )}
            </div>
            
            {/* Recipe tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags
                  .filter(tag => !['food', 'recipes', 'breakfast', 'lunch', 'dinner'].includes(tag.toLowerCase()))
                  .map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                }
              </div>
            )}
            
            {/* Recipe ingredients */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Ingredients</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>{ingredient.name}</strong>: {ingredient.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Recipe directions */}
            {renderContentSection(recipe.content, 'Directions') || 
             renderContentSection(recipe.content, 'Instructions')}
            
            {/* Recipe notes */}
            {renderContentSection(recipe.content, 'Notes')}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RecipeCard;