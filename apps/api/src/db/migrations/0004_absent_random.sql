CREATE TABLE `fighters` (
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
	`iron_number` integer,
	`class` text,
	`kit` text,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_id_number_unique` ON `fighters` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_personal_number_unique` ON `fighters` (`personal_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `fighters_iron_number_team_id_unique` ON `fighters` (`iron_number`,`team_id`);--> statement-breakpoint
CREATE TABLE `platoons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code_name` text NOT NULL,
	`description` text,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`team_number` text NOT NULL,
	`description` text,
	`platoon_id` text,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`platoon_id`) REFERENCES `platoons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`fighter_id` text NOT NULL,
	`check_in` integer,
	`check_out` integer,
	`work_date` text NOT NULL,
	`notes` text,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`fighter_id`) REFERENCES `fighters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `tasks`;