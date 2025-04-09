import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  FlameIcon, 
  InfoIcon, 
  User, 
  Utensils,
  Star
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
          <h3 className="text-lg font-semibold mb-2">{section}</h3>
          <div className="whitespace-pre-line">
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
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-medium text-gray-900 pr-6">{recipe.title}</h4>
            <div className="flex items-center">
              <button 
                onClick={handleDetailsClick} 
                className="text-gray-500 hover:text-primary mr-2"
                aria-label="View recipe details"
              >
                <InfoIcon className="h-5 w-5" />
              </button>
              <div 
                className={cn(
                  "flex-shrink-0 inline-block h-6 w-6 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary" : "bg-gray-200"
                )}
              >
                {isSelected && (selectionNumber ? (
                  <span className="text-white text-xs font-bold">{selectionNumber}</span>
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.rating && (
              <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-white" />
                <span>{recipe.rating}/7</span>
              </Badge>
            )}
            {recipe.cuisine && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {recipe.cuisine}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Recipe metadata */}
            <div className="flex flex-wrap gap-3 border-b pb-4">
              {recipe.cuisine && (
                <div className="flex items-center text-sm">
                  <Utensils className="h-4 w-4 mr-1 text-primary" />
                  <span>{recipe.cuisine} Cuisine</span>
                </div>
              )}
              
              {recipe.cookTime && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1 text-primary" />
                  <span>Cook: {recipe.cookTime} min</span>
                </div>
              )}
              
              {recipe.serves && (
                <div className="flex items-center text-sm">
                  <span>Serves: {recipe.serves}</span>
                </div>
              )}

              {recipe.author && (
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-1 text-primary" />
                  <span>By: {recipe.author}</span>
                </div>
              )}
              
              {recipe.rating && (
                <div className="flex items-center text-sm">
                  <div className="flex space-x-0.5 mr-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < (recipe.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-1">Rating: {recipe.rating}/7</span>
                </div>
              )}
            </div>
            
            {/* Recipe tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Recipe ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-start">
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