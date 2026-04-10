PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `duty_period` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_open` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text
);--> statement-breakpoint
INSERT INTO `duty_period` (`id`, `name`, `start_date`, `end_date`, `is_open`, `created_at`)
SELECT
	'00000000-0000-4000-8000-000000000001',
	'מיגרציה — נתונים לפני תקופות צו',
	COALESCE((SELECT MIN(`work_date`) FROM `attendance`), '1970-01-01'),
	COALESCE((SELECT MAX(`work_date`) FROM `attendance`), '2099-12-31'),
	0,
	datetime('now');--> statement-breakpoint
DROP INDEX `fighter_date_UN`;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`fighter_id` text NOT NULL,
	`location` text NOT NULL,
	`check_in` integer,
	`check_out` integer,
	`work_date` text NOT NULL,
	`duty_period_id` text NOT NULL,
	`notes` text,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`fighter_id`) REFERENCES `fighters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`duty_period_id`) REFERENCES `duty_period`(`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `__new_attendance` (`id`, `fighter_id`, `location`, `check_in`, `check_out`, `work_date`, `duty_period_id`, `notes`, `updated_at`, `created_at`, `deleted_at`)
SELECT `id`, `fighter_id`, `location`, `check_in`, `check_out`, `work_date`, '00000000-0000-4000-8000-000000000001', `notes`, `updated_at`, `created_at`, `deleted_at` FROM `attendance`;--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
CREATE UNIQUE INDEX `fighter_duty_period_date_UN` ON `attendance` (`fighter_id`,`duty_period_id`,`work_date`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
