PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_fighters` (
	`id` text PRIMARY KEY NOT NULL,
	`id_number` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text,
	`personal_number` text NOT NULL,
	`address` integer,
	`phone_number` text,
	`shoes_size` integer,
	`shirt_size` text,
	`pants_size` text,
	`professional` text,
	`team_id` text,
	`iron_number` text,
	`class` text,
	`kit` text,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_fighters`("id", "id_number", "first_name", "last_name", "email", "personal_number", "address", "phone_number", "shoes_size", "shirt_size", "pants_size", "professional", "team_id", "iron_number", "class", "kit", "updated_at", "created_at", "deleted_at") SELECT "id", "id_number", "first_name", "last_name", "email", "personal_number", "address", "phone_number", "shoes_size", "shirt_size", "pants_size", "professional", "team_id", "iron_number", "class", "kit", "updated_at", "created_at", "deleted_at" FROM `fighters`;--> statement-breakpoint
DROP TABLE `fighters`;--> statement-breakpoint
ALTER TABLE `__new_fighters` RENAME TO `fighters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_id_number_unique` ON `fighters` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_personal_number_unique` ON `fighters` (`personal_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_iron_number_team_id_unique` ON `fighters` (`iron_number`,`team_id`);