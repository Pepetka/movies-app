CREATE TABLE "group_movie_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_movie_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_movie_reviews_unique_idx" UNIQUE("group_movie_id","user_id"),
	CONSTRAINT "valid_review_rating_range" CHECK ("group_movie_reviews"."rating" >= 0.5 AND "group_movie_reviews"."rating" <= 5.0)
);
--> statement-breakpoint
ALTER TABLE "group_movie_reviews" ADD CONSTRAINT "group_movie_reviews_group_movie_id_group_movies_id_fk" FOREIGN KEY ("group_movie_id") REFERENCES "public"."group_movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_movie_reviews" ADD CONSTRAINT "group_movie_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_movie_reviews_group_movie_id_idx" ON "group_movie_reviews" USING btree ("group_movie_id");--> statement-breakpoint
CREATE INDEX "group_movie_reviews_user_id_idx" ON "group_movie_reviews" USING btree ("user_id");
