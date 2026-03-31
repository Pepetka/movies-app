ALTER TABLE "groups" ADD COLUMN "invite_token" varchar(32);--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_inviteToken_unique" UNIQUE("invite_token");