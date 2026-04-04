-- Rollback: reverse this migration
-- 1. ALTER TABLE "group_movies" ADD COLUMN "planned_date" timestamp;
-- 2. ALTER TABLE "group_movies" ADD COLUMN "watched_date" timestamp;
-- 3. UPDATE "group_movies" SET "planned_date" = CASE WHEN status = 'planned' THEN watch_date ELSE NULL END;
-- 4. UPDATE "group_movies" SET "watched_date" = CASE WHEN status = 'watched' THEN watch_date ELSE NULL END;
-- 5. ALTER TABLE "group_movies" DROP CONSTRAINT "tracking_forbids_watch_date";
-- 6. ALTER TABLE "group_movies" DROP CONSTRAINT "planned_requires_watch_date";
-- 7. ALTER TABLE "group_movies" DROP CONSTRAINT "watched_requires_watch_date";
-- 8. ALTER TABLE "group_movies" ADD CONSTRAINT "planned_requires_planned_date" CHECK ((status != 'planned' OR planned_date IS NOT NULL));
-- 9. ALTER TABLE "group_movies" ADD CONSTRAINT "watched_requires_watched_date" CHECK ((status != 'watched' OR watched_date IS NOT NULL));
-- 10. ALTER TABLE "group_movies" DROP COLUMN "watch_date";

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
ALTER TABLE "group_movies" ADD CONSTRAINT "watched_requires_watch_date" CHECK ((status != 'watched' OR watch_date IS NOT NULL));--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "tracking_forbids_watch_date" CHECK ((status != 'tracking' OR watch_date IS NULL));
