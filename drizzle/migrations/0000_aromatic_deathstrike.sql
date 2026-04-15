CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "admin_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(128) NOT NULL,
	"passwordHash" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_credentials_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "merch_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"category" varchar(64) NOT NULL,
	"price" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"description" text,
	"sizes" text NOT NULL,
	"tags" text NOT NULL,
	"collectionTag" varchar(64),
	"isActive" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"shopifyUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(128) NOT NULL,
	"label" varchar(256) NOT NULL,
	"section" varchar(64) NOT NULL,
	"url" text NOT NULL,
	"altText" varchar(256),
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_images_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tour_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(32) NOT NULL,
	"city" varchar(128) NOT NULL,
	"venue" varchar(256) NOT NULL,
	"country" varchar(64) DEFAULT 'India' NOT NULL,
	"ticketUrl" text,
	"isSoldOut" boolean DEFAULT false NOT NULL,
	"isPast" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upi_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"upiId" varchar(128) NOT NULL,
	"accountName" varchar(128) NOT NULL,
	"qrCodeUrl" text,
	"whatsappNumber" varchar(32),
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
