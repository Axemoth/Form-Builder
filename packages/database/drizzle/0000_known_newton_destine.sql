CREATE TYPE "public"."collaborator_role" AS ENUM('viewer', 'editor');--> statement-breakpoint
CREATE TYPE "public"."email_log_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."email_log_type" AS ENUM('creator_notification', 'respondent_confirmation');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('short_text', 'long_text', 'email', 'number', 'single_select', 'multi_select', 'checkbox', 'rating', 'date');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'unpublished');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('new_response', 'form_published');--> statement-breakpoint
CREATE TYPE "public"."plan_name" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"type" "email_log_type" NOT NULL,
	"status" "email_log_status" NOT NULL,
	"form_id" uuid,
	"response_id" uuid,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"notify_creator" boolean DEFAULT false NOT NULL,
	"notify_respondent" boolean DEFAULT false NOT NULL,
	"creator_template" text,
	"respondent_template" text,
	CONSTRAINT "email_notifications_form_id_unique" UNIQUE("form_id")
);
--> statement-breakpoint
CREATE TABLE "field_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"order" integer NOT NULL,
	"color" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"type" "field_type" NOT NULL,
	"label" text NOT NULL,
	"placeholder" text,
	"required" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"options" jsonb,
	"validations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"submissions" integer DEFAULT 0 NOT NULL,
	"dropoffs" integer DEFAULT 0 NOT NULL,
	"avg_completion_time" integer
);
--> statement-breakpoint
CREATE TABLE "form_collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "collaborator_role" NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "form_tags" (
	"form_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "form_tags_form_id_tag_id_pk" PRIMARY KEY("form_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "form_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"primary_color" varchar(50) NOT NULL,
	"background_color" varchar(50) NOT NULL,
	"font_family" varchar(100) NOT NULL,
	"background_image" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_themes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "form_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"country" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"visibility" "form_visibility" DEFAULT 'public' NOT NULL,
	"theme" jsonb,
	"theme_id" uuid,
	"response_limit" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "plan_name" NOT NULL,
	"price" integer NOT NULL,
	"response_limit" integer NOT NULL,
	"form_limit" integer NOT NULL,
	"features" jsonb NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "response_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"ip_hash" varchar(64) NOT NULL,
	"user_agent" text,
	"country" varchar(100),
	"completion_time" integer,
	"referrer" text,
	CONSTRAINT "response_metadata_response_id_unique" UNIQUE("response_id")
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"respondent_email" varchar(255),
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(50),
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar" text,
	"password_hash" varchar(255),
	"google_id" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_options" ADD CONSTRAINT "field_options_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_analytics" ADD CONSTRAINT "form_analytics_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_collaborators" ADD CONSTRAINT "form_collaborators_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_collaborators" ADD CONSTRAINT "form_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_tags" ADD CONSTRAINT "form_tags_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_tags" ADD CONSTRAINT "form_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_themes" ADD CONSTRAINT "form_themes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_views" ADD CONSTRAINT "form_views_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_theme_id_form_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."form_themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_metadata" ADD CONSTRAINT "response_metadata_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;