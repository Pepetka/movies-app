CREATE TYPE "public"."custom_movie_status" AS ENUM('tracking', 'planned', 'watched');--> statement-breakpoint
ALTER TABLE "custom_movies" ADD COLUMN "status" "custom_movie_status" DEFAULT 'tracking' NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_movies" ADD COLUMN "planned_date" timestamp;--> statement-breakpoint
ALTER TABLE "custom_movies" ADD COLUMN "watched_date" timestamp;--> statement-breakpoint
CREATE INDEX "custom_movies_status_idx" ON "custom_movies" USING btree ("status");