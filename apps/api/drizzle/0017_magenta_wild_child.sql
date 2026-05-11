ALTER TABLE "group_movies" DROP CONSTRAINT "group_movies_added_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "group_movies" ALTER COLUMN "added_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "group_movies_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;