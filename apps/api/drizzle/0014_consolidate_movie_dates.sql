ALTER TABLE "group_movies" ADD COLUMN "watch_date" timestamp;--> statement-breakpoint
UPDATE "group_movies" SET "watch_date" = CASE
  WHEN status = 'watched' AND watched_date IS NOT NULL THEN watched_date
  WHEN status = 'planned' AND planned_date IS NOT NULL THEN planned_date
  ELSE NULL
END;--> statement-breakpoint
ALTER TABLE "group_movies" DROP CONSTRAINT IF EXISTS "planned_requires_planned_date";--> statement-breakpoint
ALTER TABLE "group_movies" DROP CONSTRAINT IF EXISTS "watched_requires_watched_date";--> statement-breakpoint
ALTER TABLE "group_movies" DROP COLUMN "planned_date";--> statement-breakpoint
ALTER TABLE "group_movies" DROP COLUMN "watched_date";--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "planned_requires_watch_date" CHECK ((status != 'planned' OR watch_date IS NOT NULL));--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "watched_requires_watch_date" CHECK ((status != 'watched' OR watch_date IS NOT NULL));
