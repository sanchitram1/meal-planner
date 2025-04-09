# Meal Planning App

A meal planning application that helps users select recipes, create weekly meal plans, and generate grocery lists.

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

## Features

- Browse breakfast and dinner recipes
- Select recipes for a weekly meal plan
- Automatically create lunch meals from the previous day's dinner
- Generate a grocery list based on your meal plan
- Organize groceries by category for easier shopping