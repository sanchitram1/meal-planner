CREATE TABLE "meal_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"breakfast_ids" text[] NOT NULL,
	"dinner_ids" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_name" text NOT NULL,
	"type" text NOT NULL,
	"cuisine" text NOT NULL,
	"author" text NOT NULL,
	"serves" integer NOT NULL,
	"ingredients" jsonb NOT NULL,
	"rating" integer NOT NULL,
	"last" timestamp NOT NULL,
	"content" text NOT NULL,
	"tags" text[] NOT NULL
);
