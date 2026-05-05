CREATE TYPE "public"."reputation_level" AS ENUM('bronze', 'silver', 'gold');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."usage_type" AS ENUM('course', 'social_event', 'content_recording');--> statement-breakpoint
CREATE TYPE "public"."contribution_status" AS ENUM('pending', 'delivered', 'validated');--> statement-breakpoint
CREATE TYPE "public"."contribution_type" AS ENUM('donation', 'time_impact', 'content_impact');--> statement-breakpoint
CREATE TYPE "public"."impact_category_name" AS ENUM('food', 'education', 'community');--> statement-breakpoint
CREATE TYPE "public"."reputation_event_type" AS ENUM('event_completed', 'contribution_delivered', 'impact_validated', 'no_show');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"reputation_score" integer DEFAULT 0 NOT NULL,
	"reputation_level" "reputation_level" DEFAULT 'bronze' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"usage_type" "usage_type" NOT NULL,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"event_title" text NOT NULL,
	"event_description" text NOT NULL,
	"estimated_value" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"type" "contribution_type" NOT NULL,
	"subtype" text NOT NULL,
	"quantity" numeric NOT NULL,
	"unit" text NOT NULL,
	"equivalent_value" numeric NOT NULL,
	"status" "contribution_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "impact_category_name" NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_impacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"impact_category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "reputation_event_type" NOT NULL,
	"points" integer NOT NULL,
	"reservation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_impacts" ADD CONSTRAINT "reservation_impacts_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_impacts" ADD CONSTRAINT "reservation_impacts_impact_category_id_impact_categories_id_fk" FOREIGN KEY ("impact_category_id") REFERENCES "public"."impact_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_events" ADD CONSTRAINT "reputation_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_events" ADD CONSTRAINT "reputation_events_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;