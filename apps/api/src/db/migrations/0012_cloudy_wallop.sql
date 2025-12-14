CREATE TABLE `serialized_gear` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gear_name_un` ON `serialized_gear` (`name`);--> statement-breakpoint
CREATE TABLE `serialized_gear_check` (
	`id` text PRIMARY KEY NOT NULL,
	`serialized_gear_fighter_id` text NOT NULL,
	`date` text NOT NULL,
	`is_check` integer DEFAULT false NOT NULL,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`serialized_gear_fighter_id`) REFERENCES `serialized_gear_fighter`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gear_fighter_date_un` ON `serialized_gear_check` (`serialized_gear_fighter_id`,`date`);--> statement-breakpoint
CREATE TABLE `serialized_gear_fighter` (
	`id` text PRIMARY KEY NOT NULL,
	`serialized_gear_id` text NOT NULL,
	`fighter_id` text NOT NULL,
	`serial_number` text,
	`issued_date` text,
	`last_check_date` text,
	`location` text,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`serialized_gear_id`) REFERENCES `serialized_gear`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fighter_id`) REFERENCES `fighters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `serial_gear_un` ON `serialized_gear_fighter` (`serial_number`,`serialized_gear_id`);