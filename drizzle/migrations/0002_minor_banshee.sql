ALTER TABLE "orders" ADD COLUMN "paymentMethod" varchar(32) DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpayOrderId" varchar(128);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpayPaymentId" varchar(128);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "utrNumber" varchar(64);