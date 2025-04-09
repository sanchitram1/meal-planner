import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, FlameIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@shared/schema";

type RecipeCardProps = {
  recipe: Recipe;
  isSelected: boolean;
  onClick: () => void;
};

export function RecipeCard({ recipe, isSelected, onClick }: RecipeCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-primary bg-primary/5" : "border-gray-200"
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-medium text-gray-900">{recipe.title}</h4>
          <div 
            className={cn(
              "flex-shrink-0 inline-block h-6 w-6 rounded-full flex items-center justify-center",
              isSelected ? "bg-primary" : "bg-gray-200"
            )}
          >
            {isSelected && <CheckCircle2 className="h-5 w-5 text-white" />}
          </div>
        </div>
        
        <p className="mt-1 text-sm text-gray-600">
          <span className="inline-flex items-center">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{recipe.prepTime} min</span>
          </span>
          {recipe.calories && (
            <span className="inline-flex items-center ml-3">
              <FlameIcon className="mr-1 h-3.5 w-3.5" />
              <span>{recipe.calories} cal</span>
            </span>
          )}
        </p>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {recipe.cuisine && (
            <Badge variant="secondary" className="bg-primary/10 text-primary-foreground hover:bg-primary/20">
              {recipe.cuisine}
            </Badge>
          )}
          {recipe.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="bg-gray-100 hover:bg-gray-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecipeCard;
