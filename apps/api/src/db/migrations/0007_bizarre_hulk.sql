PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`fighter_id` text NOT NULL,
	`location` text NOT NULL,
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
INSERT INTO `__new_attendance`("id", "fighter_id", "location", "check_in", "check_out", "work_date", "notes", "updated_at", "created_at", "deleted_at") SELECT "id", "fighter_id", "location", "check_in", "check_out", "work_date", "notes", "updated_at", "created_at", "deleted_at" FROM `attendance`;--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `fighter_date_UN` ON `attendance` (`fighter_id`,`work_date`);