CREATE TABLE `logistic_gear` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`quantity` integer DEFAULT 0 NOT NULL,
	`location` text,
	`team_id` text NOT NULL,
	`time_of_issue` text,
	`updated_at` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
