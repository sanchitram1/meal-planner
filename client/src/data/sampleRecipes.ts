import { Recipe } from '@shared/schema';

// Sample breakfast recipes for initial testing
export const breakfastRecipes: Recipe[] = [
  {
    id: 1,
    title: 'Overnight Oats',
    fileName: 'overnight-oats.md',
    type: 'breakfast',
    prepTime: 10,
    calories: 350,
    cuisine: 'American',
    content: `
# Overnight Oats

Simple and nutritious breakfast prepared the night before.

## Instructions
1. Combine all ingredients in a jar.
2. Stir well and seal.
3. Refrigerate overnight.
4. Enjoy in the morning!
    `,
    tags: ['quick', 'healthy', 'vegan-option'],
    ingredients: [
      { name: 'Rolled oats', amount: '1/2 cup', category: 'pantry' },
      { name: 'Milk', amount: '1/2 cup', category: 'dairy' },
      { name: 'Greek yogurt', amount: '1/4 cup', category: 'dairy' },
      { name: 'Chia seeds', amount: '1 tbsp', category: 'pantry' },
      { name: 'Honey', amount: '1 tbsp', category: 'pantry' },
      { name: 'Berries', amount: '1/4 cup', category: 'produce' }
    ]
  },
  {
    id: 2,
    title: 'Avocado Toast',
    fileName: 'avocado-toast.md',
    type: 'breakfast',
    prepTime: 5,
    calories: 300,
    cuisine: 'Modern',
    content: `
# Avocado Toast

A modern classic that's both healthy and delicious.

## Instructions
1. Toast the bread.
2. Mash the avocado and spread on toast.
3. Cook eggs as desired (optional).
4. Top with seasonings.
    `,
    tags: ['quick', 'healthy', 'vegetarian'],
    ingredients: [
      { name: 'Whole grain bread', amount: '2 slices', category: 'pantry' },
      { name: 'Avocado', amount: '1', category: 'produce' },
      { name: 'Eggs', amount: '2', category: 'dairy' },
      { name: 'Salt', amount: 'to taste', category: 'pantry' },
      { name: 'Pepper', amount: 'to taste', category: 'pantry' },
      { name: 'Red pepper flakes', amount: 'pinch', category: 'pantry' }
    ]
  },
  {
    id: 3,
    title: 'Greek Yogurt Parfait',
    fileName: 'greek-yogurt-parfait.md',
    type: 'breakfast',
    prepTime: 5,
    calories: 250,
    cuisine: 'Mediterranean',
    content: `
# Greek Yogurt Parfait

A protein-rich breakfast option.

## Instructions
1. Layer yogurt, granola, and berries in a glass.
2. Drizzle with honey.
3. Enjoy immediately.
    `,
    tags: ['quick', 'protein-rich', 'no-cook'],
    ingredients: [
      { name: 'Greek yogurt', amount: '1 cup', category: 'dairy' },
      { name: 'Granola', amount: '1/4 cup', category: 'pantry' },
      { name: 'Honey', amount: '1 tbsp', category: 'pantry' },
      { name: 'Berries', amount: '1/2 cup', category: 'produce' }
    ]
  },
  {
    id: 4,
    title: 'Spinach Omelette',
    fileName: 'spinach-omelette.md',
    type: 'breakfast',
    prepTime: 15,
    calories: 320,
    cuisine: 'French',
    content: `
# Spinach Omelette

A protein-packed breakfast.

## Instructions
1. Whisk eggs in a bowl.
2. Heat oil in a non-stick pan.
3. Pour in eggs and add spinach.
4. Cook until set and add cheese.
5. Fold and serve.
    `,
    tags: ['protein-rich', 'low-carb', 'keto'],
    ingredients: [
      { name: 'Eggs', amount: '3', category: 'dairy' },
      { name: 'Spinach', amount: '1 cup', category: 'produce' },
      { name: 'Feta cheese', amount: '2 tbsp', category: 'dairy' },
      { name: 'Olive oil', amount: '1 tsp', category: 'pantry' },
      { name: 'Salt', amount: 'to taste', category: 'pantry' },
      { name: 'Pepper', amount: 'to taste', category: 'pantry' }
    ]
  },
  {
    id: 5,
    title: 'Banana Smoothie Bowl',
    fileName: 'banana-smoothie-bowl.md',
    type: 'breakfast',
    prepTime: 8,
    calories: 380,
    cuisine: 'Fusion',
    content: `
# Banana Smoothie Bowl

A refreshing and filling breakfast.

## Instructions
1. Blend frozen banana, milk, and protein powder.
2. Pour into a bowl.
3. Top with granola, berries, and peanut butter.
    `,
    tags: ['vegan', 'refreshing', 'fruit'],
    ingredients: [
      { name: 'Frozen banana', amount: '2', category: 'produce' },
      { name: 'Almond milk', amount: '1/2 cup', category: 'dairy' },
      { name: 'Protein powder', amount: '1 scoop', category: 'pantry' },
      { name: 'Peanut butter', amount: '1 tbsp', category: 'pantry' },
      { name: 'Granola', amount: '2 tbsp', category: 'pantry' },
      { name: 'Berries', amount: 'for topping', category: 'produce' }
    ]
  },
  {
    id: 6,
    title: 'Cottage Cheese & Fruit',
    fileName: 'cottage-cheese-fruit.md',
    type: 'breakfast',
    prepTime: 3,
    calories: 200,
    cuisine: 'American',
    content: `
# Cottage Cheese & Fruit

A simple, protein-rich breakfast.

## Instructions
1. Add cottage cheese to a bowl.
2. Top with mixed berries.
3. Drizzle with honey and sprinkle with cinnamon.
    `,
    tags: ['quick', 'protein-rich', 'low-calorie'],
    ingredients: [
      { name: 'Cottage cheese', amount: '1 cup', category: 'dairy' },
      { name: 'Mixed berries', amount: '1/2 cup', category: 'produce' },
      { name: 'Honey', amount: '1 tsp', category: 'pantry' },
      { name: 'Cinnamon', amount: 'pinch', category: 'pantry' }
    ]
  }
];

// Sample dinner recipes for initial testing
export const dinnerRecipes: Recipe[] = [
  {
    id: 7,
    title: 'Baked Salmon',
    fileName: 'baked-salmon.md',
    type: 'dinner',
    prepTime: 25,
    calories: 450,
    cuisine: 'Scandinavian',
    content: `
# Baked Salmon

A healthy, omega-3 rich dinner option.

## Instructions
1. Preheat oven to 375°F (190°C).
2. Place salmon on baking sheet.
3. Mix olive oil, garlic, dill, and lemon juice.
4. Pour over salmon and season.
5. Bake for 15-20 minutes.
    `,
    tags: ['seafood', 'healthy', 'omega-3'],
    ingredients: [
      { name: 'Salmon fillets', amount: '4 (6oz each)', category: 'proteins' },
      { name: 'Lemon', amount: '1', category: 'produce' },
      { name: 'Olive oil', amount: '2 tbsp', category: 'pantry' },
      { name: 'Dill', amount: '2 tbsp', category: 'produce' },
      { name: 'Garlic', amount: '2 cloves', category: 'produce' },
      { name: 'Salt', amount: 'to taste', category: 'pantry' },
      { name: 'Pepper', amount: 'to taste', category: 'pantry' }
    ]
  },
  {
    id: 8,
    title: 'Chicken Stir Fry',
    fileName: 'chicken-stir-fry.md',
    type: 'dinner',
    prepTime: 20,
    calories: 380,
    cuisine: 'Asian Fusion',
    content: `
# Chicken Stir Fry

A quick and protein-rich dinner.

## Instructions
1. Slice chicken and vegetables.
2. Heat oil in a wok or large pan.
3. Cook chicken until no longer pink.
4. Add vegetables and stir-fry until tender-crisp.
5. Add soy sauce, ginger, and garlic.
6. Serve over cooked brown rice.
    `,
    tags: ['quick', 'protein-rich', 'vegetables'],
    ingredients: [
      { name: 'Chicken breast', amount: '1 lb', category: 'proteins' },
      { name: 'Bell peppers', amount: '2', category: 'produce' },
      { name: 'Broccoli', amount: '1 head', category: 'produce' },
      { name: 'Carrots', amount: '2', category: 'produce' },
      { name: 'Soy sauce', amount: '3 tbsp', category: 'pantry' },
      { name: 'Ginger', amount: '1 tbsp', category: 'produce' },
      { name: 'Garlic', amount: '3 cloves', category: 'produce' },
      { name: 'Brown rice', amount: '2 cups cooked', category: 'pantry' }
    ]
  },
  {
    id: 9,
    title: 'Vegetarian Pasta',
    fileName: 'vegetarian-pasta.md',
    type: 'dinner',
    prepTime: 30,
    calories: 420,
    cuisine: 'Italian',
    content: `
# Vegetarian Pasta

A comforting pasta dish loaded with vegetables.

## Instructions
1. Cook pasta according to package directions.
2. Heat olive oil in a large pan.
3. Add garlic and cherry tomatoes, cook until softened.
4. Add spinach and cook until wilted.
5. Toss with pasta, top with parmesan and basil.
    `,
    tags: ['vegetarian', 'comfort-food', 'family-friendly'],
    ingredients: [
      { name: 'Pasta', amount: '8 oz', category: 'pantry' },
      { name: 'Cherry tomatoes', amount: '2 cups', category: 'produce' },
      { name: 'Spinach', amount: '2 cups', category: 'produce' },
      { name: 'Garlic', amount: '4 cloves', category: 'produce' },
      { name: 'Olive oil', amount: '2 tbsp', category: 'pantry' },
      { name: 'Parmesan cheese', amount: '1/4 cup', category: 'dairy' },
      { name: 'Basil', amount: '1/4 cup', category: 'produce' },
      { name: 'Salt', amount: 'to taste', category: 'pantry' },
      { name: 'Pepper', amount: 'to taste', category: 'pantry' }
    ]
  },
  {
    id: 10,
    title: 'Turkey Burgers',
    fileName: 'turkey-burgers.md',
    type: 'dinner',
    prepTime: 25,
    calories: 350,
    cuisine: 'American',
    content: `
# Turkey Burgers

Lean and flavorful burgers perfect for a family dinner.

## Instructions
1. Mix ground turkey, onion, garlic, and Worcestershire sauce.
2. Form into patties.
3. Grill or pan-fry until cooked through.
4. Serve on whole grain buns with lettuce, tomato, and avocado.
    `,
    tags: ['grilling', 'lean-protein', 'family-friendly'],
    ingredients: [
      { name: 'Ground turkey', amount: '1 lb', category: 'proteins' },
      { name: 'Onion', amount: '1/2, minced', category: 'produce' },
      { name: 'Garlic', amount: '2 cloves', category: 'produce' },
      { name: 'Worcestershire sauce', amount: '1 tbsp', category: 'pantry' },
      { name: 'Whole grain buns', amount: '4', category: 'pantry' },
      { name: 'Lettuce', amount: '4 leaves', category: 'produce' },
      { name: 'Tomato', amount: '1, sliced', category: 'produce' },
      { name: 'Avocado', amount: '1', category: 'produce' }
    ]
  },
  {
    id: 11,
    title: 'Quinoa Bowl',
    fileName: 'quinoa-bowl.md',
    type: 'dinner',
    prepTime: 20,
    calories: 400,
    cuisine: 'Modern',
    content: `
# Quinoa Bowl

A nutritious grain bowl packed with protein and vegetables.

## Instructions
1. Cook quinoa according to package directions.
2. Combine cooked quinoa with black beans and corn.
3. Add diced avocado and cherry tomatoes.
4. Drizzle with lime juice and olive oil.
5. Garnish with cilantro.
    `,
    tags: ['vegetarian', 'grain-bowl', 'high-protein'],
    ingredients: [
      { name: 'Quinoa', amount: '1 cup, cooked', category: 'pantry' },
      { name: 'Black beans', amount: '1/2 cup', category: 'pantry' },
      { name: 'Corn', amount: '1/2 cup', category: 'produce' },
      { name: 'Avocado', amount: '1/2', category: 'produce' },
      { name: 'Cherry tomatoes', amount: '1/2 cup', category: 'produce' },
      { name: 'Lime juice', amount: '1 tbsp', category: 'produce' },
      { name: 'Cilantro', amount: '2 tbsp', category: 'produce' },
      { name: 'Olive oil', amount: '1 tbsp', category: 'pantry' }
    ]
  },
  {
    id: 12,
    title: 'Tofu Curry',
    fileName: 'tofu-curry.md',
    type: 'dinner',
    prepTime: 35,
    calories: 380,
    cuisine: 'Indian',
    content: `
# Tofu Curry

A flavorful vegan curry that's perfect for dinner.

## Instructions
1. Press and cube tofu.
2. Sauté onion, bell pepper, garlic, and ginger.
3. Add curry paste and cook until fragrant.
4. Add coconut milk and bring to a simmer.
5. Add tofu and cook until heated through.
6. Stir in spinach until wilted.
7. Serve over cooked basmati rice.
    `,
    tags: ['vegan', 'spicy', 'vegetables'],
    ingredients: [
      { name: 'Tofu', amount: '14 oz', category: 'proteins' },
      { name: 'Coconut milk', amount: '1 can', category: 'pantry' },
      { name: 'Curry paste', amount: '2 tbsp', category: 'pantry' },
      { name: 'Onion', amount: '1', category: 'produce' },
      { name: 'Bell pepper', amount: '1', category: 'produce' },
      { name: 'Spinach', amount: '2 cups', category: 'produce' },
      { name: 'Ginger', amount: '1 tbsp', category: 'produce' },
      { name: 'Garlic', amount: '3 cloves', category: 'produce' },
      { name: 'Basmati rice', amount: '1 cup, cooked', category: 'pantry' }
    ]
  }
];

// All recipes for convenience
export const allRecipes = [...breakfastRecipes, ...dinnerRecipes];
