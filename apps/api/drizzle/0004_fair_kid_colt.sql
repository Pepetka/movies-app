CREATE TYPE "public"."group_member_role" AS ENUM('admin', 'moderator', 'member');--> statement-breakpoint
CREATE TYPE "public"."group_movie_status" AS ENUM('tracking', 'planned', 'watched');--> statement-breakpoint
CREATE TABLE "custom_movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"poster_path" varchar(512),
	"overview" text,
	"release_year" integer,
	"runtime" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "group_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_groupId_userId_unique" UNIQUE("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "group_movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"added_by" integer NOT NULL,
	"status" "group_movie_status" DEFAULT 'tracking' NOT NULL,
	"planned_date" timestamp,
	"watched_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_movies_groupId_movieId_unique" UNIQUE("group_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"avatar_url" varchar(512),
	"owner_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "imdb_id" varchar(20);--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "poster_path" varchar(512);--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "overview" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "release_year" integer;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "rating" numeric(3, 1);--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "genres" jsonb;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "runtime" integer;--> statement-breakpoint
ALTER TABLE "custom_movies" ADD CONSTRAINT "custom_movies_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_movies" ADD CONSTRAINT "custom_movies_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "group_movies_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "group_movies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_movies" ADD CONSTRAINT "group_movies_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_id_idx" ON "custom_movies" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "custom_movies_title_idx" ON "custom_movies" USING btree ("title");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "group_members_group_id_idx" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "owner_id_idx" ON "groups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "imdb_id_idx" ON "movies" USING btree ("imdb_id");