CREATE TYPE "public"."movie_source" AS ENUM('provider', 'custom');--> statement-breakpoint
ALTER TABLE "group_movies" DROP CONSTRAINT "group_movies_movie_id_movies_id_fk";
--> statement-breakpoint
ALTER TABLE "group_movies" ALTER COLUMN "movie_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "source" "movie_source" DEFAULT 'provider' NOT NULL;--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "poster_path" varchar(512);--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "overview" text;--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "release_year" integer;--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "runtime" integer;--> statement-breakpoint
ALTER TABLE "group_movies" ADD COLUMN "rating" numeric(3, 1);--> statement-breakpoint
-- Migrate existing provider movies data
UPDATE "group_movies" gm
SET
  "source" = 'provider',
  "title" = m."title",
  "poster_path" = m."poster_path",
  "overview" = m."overview",
  "release_year" = m."release_year",
  "runtime" = m."runtime",
  "rating" = m."rating"
FROM "movies" m
WHERE gm."movie_id" = m."id";--> statement-breakpoint
-- Migrate custom_movies to group_movies
INSERT INTO "group_movies" (
  "group_id", "source", "movie_id", "title", "poster_path", "overview",
  "release_year", "runtime", "rating", "status", "planned_date", "watched_date",
  "added_by", "created_at", "updated_at"
)
SELECT
  "group_id", 'custom', NULL, "title", "poster_path", "overview",
  "release_year", "runtime", NULL, "status"::text::group_movie_status, "planned_date", "watched_date",
  "created_by_id", "created_at", "updated_at"
FROM "custom_movies";--> statement-breakpoint
-- Now make title NOT NULL after data migration
ALTER TABLE "group_movies" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "group_movies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_movies_movie_id_idx" ON "group_movies" USING btree ("movie_id");
