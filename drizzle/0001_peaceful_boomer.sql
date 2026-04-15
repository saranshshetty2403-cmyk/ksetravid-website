CREATE TABLE `merch_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`category` varchar(64) NOT NULL,
	`price` int NOT NULL,
	`imageUrl` text NOT NULL,
	`description` text,
	`sizes` text NOT NULL,
	`tags` text NOT NULL,
	`collectionTag` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`shopifyUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merch_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`label` varchar(256) NOT NULL,
	`section` varchar(64) NOT NULL,
	`url` text NOT NULL,
	`altText` varchar(256),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_images_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_images_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tour_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(32) NOT NULL,
	`city` varchar(128) NOT NULL,
	`venue` varchar(256) NOT NULL,
	`country` varchar(64) NOT NULL DEFAULT 'India',
	`ticketUrl` text,
	`isSoldOut` boolean NOT NULL DEFAULT false,
	`isPast` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tour_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `upi_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`upiId` varchar(128) NOT NULL,
	`accountName` varchar(128) NOT NULL,
	`qrCodeUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `upi_settings_id` PRIMARY KEY(`id`)
);
