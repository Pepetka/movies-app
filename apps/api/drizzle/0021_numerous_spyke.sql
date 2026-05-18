CREATE TABLE "group_movie_review_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_movie_review_reactions_unique_idx" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "group_movie_review_reactions" ADD CONSTRAINT "group_movie_review_reactions_review_id_group_movie_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."group_movie_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_movie_review_reactions" ADD CONSTRAINT "group_movie_review_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_movie_review_reactions_review_id_idx" ON "group_movie_review_reactions" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "group_movie_review_reactions_user_id_idx" ON "group_movie_review_reactions" USING btree ("user_id");