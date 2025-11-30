PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_fighters` (
	`id` text PRIMARY KEY NOT NULL,
	`id_number` text,
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
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_fighters`("id", "id_number", "first_name", "last_name", "email", "personal_number", "address", "phone_number", "shoes_size", "shirt_size", "pants_size", "professional", "team_id", "iron_number", "class", "kit", "updated_at", "created_at", "deleted_at") SELECT "id", "id_number", "first_name", "last_name", "email", "personal_number", "address", "phone_number", "shoes_size", "shirt_size", "pants_size", "professional", "team_id", "iron_number", "class", "kit", "updated_at", "created_at", "deleted_at" FROM `fighters`;--> statement-breakpoint
DROP TABLE `fighters`;--> statement-breakpoint
ALTER TABLE `__new_fighters` RENAME TO `fighters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_id_number_unique` ON `fighters` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_personal_number_unique` ON `fighters` (`personal_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_iron_number_team_id_unique` ON `fighters` (`iron_number`,`team_id`);--> statement-breakpoint
CREATE TABLE `__new_platoons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code_name` text NOT NULL,
	`description` text,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_platoons`("id", "name", "code_name", "description", "updated_at", "created_at", "deleted_at") SELECT "id", "name", "code_name", "description", "updated_at", "created_at", "deleted_at" FROM `platoons`;--> statement-breakpoint
DROP TABLE `platoons`;--> statement-breakpoint
ALTER TABLE `__new_platoons` RENAME TO `platoons`;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`team_number` text NOT NULL,
	`description` text,
	`platoon_id` text,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`platoon_id`) REFERENCES `platoons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "name", "team_number", "description", "platoon_id", "updated_at", "created_at", "deleted_at") SELECT "id", "name", "team_number", "description", "platoon_id", "updated_at", "created_at", "deleted_at" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`fighter_id` text NOT NULL,
	`location` text NOT NULL,
	`check_in` integer,
	`check_out` integer,
	`work_date` text NOT NULL,
	`notes` text,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`fighter_id`) REFERENCES `fighters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_attendance`("id", "fighter_id", "location", "check_in", "check_out", "work_date", "notes", "updated_at", "created_at", "deleted_at") SELECT "id", "fighter_id", "location", "check_in", "check_out", "work_date", "notes", "updated_at", "created_at", "deleted_at" FROM `attendance`;--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
CREATE UNIQUE INDEX `fighter_date_UN` ON `attendance` (`fighter_id`,`work_date`);--> statement-breakpoint
ALTER TABLE `user` ADD `role` text NOT NULL;