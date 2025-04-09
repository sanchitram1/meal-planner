# Meal Planning App

A meal planning application that helps users select recipes, create weekly meal plans, and generate grocery lists. Now with support for importing Obsidian markdown recipes!

## Features

- Browse breakfast and dinner recipes
- Select recipes for a weekly meal plan
- Automatically create lunch meals from the previous day's dinner
- Generate a grocery list based on your meal plan
- Organize groceries by category for easier shopping
- **NEW**: Import recipes from Obsidian markdown files

## Importing Obsidian Recipes

### How to Import Recipes

1. Place your Obsidian markdown recipe files in the `recipes` directory
2. Run the import script: `./import-recipes.sh`
3. Your recipes will be imported into the app's database

### Supported Obsidian Recipe Formats

The importer supports various Obsidian markdown recipe formats:

#### YAML Frontmatter Support

```yaml
---
title: Recipe Title
type: breakfast  # or dinner, etc.
cuisine: American  # or any cuisine
author: Your Name
serves: 4
rating: 5  # scale of 1-10
last: 2025-04-09  # date of last modification
content: "A brief description"
tags: [breakfast, quick, easy]  # tags for categorization
ingredients:
  - name: ingredient1
    amount: 1 cup
    category: produce  # produce, dairy, proteins, pantry, other
  - name: ingredient2
    amount: 2 tablespoons
    category: pantry
---
```

#### Obsidian-Specific Format Support

The importer also supports Obsidian-specific markdown features:

- **Obsidian References**: References like `[[South Indian]]` will be properly parsed
- **Ingredient Lists**: Will parse ingredient details from the content section
- **Content Extraction**: Properly extracts sections and formatting from the markdown content

Example of an Obsidian-style recipe:

```markdown
---
created: 2025-04-01
category:
  - "[[Recipes]]"
author:
  - "[[Your Name]]"
type:
  - "[[South Indian]]"
serves: 4
ingredients:
  - "[[Carrot]]"
  - "[[Jaggery]]"
  - "[[Salt]]"
tags:
  - recipes
  - dinner
---
## Ingredients

- 4 carrots – boiled
- Jaggery
- Salt
- Tamarind water

## Directions

### Step 1

- Boil the carrots in the [[Instapot]] for at least 4 minutes.
- Add them to a blender with water as appropriate, and make it a fine mixture
```

### Recipe Type Detection

The app will intelligently categorize your recipes as breakfast or dinner based on:

1. Explicit `type` field in the frontmatter
2. Tags containing breakfast/dinner 
3. Content mentioning breakfast/dinner
4. Cuisine field if it contains breakfast/dinner

## Database Setup

The application uses a PostgreSQL database for data storage. Follow these steps to set up the database:

1. **Push the schema to the database**:
   ```bash
   npm run db:push
   ```
   This command will create the necessary tables in your PostgreSQL database.

2. **Seed the database with initial recipes**:
   ```bash
   ./scripts/seed.sh
   ```
   This will populate the database with sample recipes.

## Running the Application

To start the application in development mode:

```bash
npm run dev
```

The application will be available at http://localhost:5000.