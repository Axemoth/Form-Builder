ALTER TABLE "forms" ADD COLUMN "submit_button_text" varchar(255) DEFAULT 'Submit';--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "success_message" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "redirect_url" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "require_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "allow_multiple_responses" boolean DEFAULT true NOT NULL;