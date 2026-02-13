ALTER TABLE "groups" DROP CONSTRAINT "groups_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "owner_id_idx";--> statement-breakpoint
ALTER TABLE "groups" DROP COLUMN "owner_id";