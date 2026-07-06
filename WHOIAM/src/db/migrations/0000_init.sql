CREATE TABLE `check_ins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scheduled_for` integer NOT NULL,
	`completed_at` integer,
	`mood` integer,
	`urge` integer,
	`had_slip` integer,
	`note` text
);
--> statement-breakpoint
CREATE INDEX `check_ins_scheduled_idx` ON `check_ins` (`scheduled_for`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`motivation_text` text,
	`schedule_json` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE TABLE `kv` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`time` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`os_identifier` text
);
--> statement-breakpoint
CREATE TABLE `slip_ups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal_id` integer,
	`occurred_at` integer NOT NULL,
	`what` text NOT NULL,
	`trigger` text,
	`severity` integer,
	`note` text,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `slip_ups_goal_idx` ON `slip_ups` (`goal_id`);--> statement-breakpoint
CREATE TABLE `streaks` (
	`goal_id` integer PRIMARY KEY NOT NULL,
	`current` integer DEFAULT 0 NOT NULL,
	`longest` integer DEFAULT 0 NOT NULL,
	`last_counted_day` text,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `unlock_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rule_id` integer NOT NULL,
	`intent_text` text NOT NULL,
	`requested_minutes` integer NOT NULL,
	`granted_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`ended_at` integer,
	`ended_reason` text,
	FOREIGN KEY (`rule_id`) REFERENCES `vault_rules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `unlock_events_rule_time_idx` ON `unlock_events` (`rule_id`,`granted_at`);--> statement-breakpoint
CREATE TABLE `vault_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal_id` integer,
	`selection_ref` text NOT NULL,
	`shield_title` text,
	`shield_subtitle` text,
	`default_unlock_minutes` integer DEFAULT 15 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vault_rules_goal_idx` ON `vault_rules` (`goal_id`);