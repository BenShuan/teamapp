-- Step 1: Add the column as nullable first
ALTER TABLE `serialized_gear_fighter` ADD `fighters_team_id` text;

-- Step 2: Populate it with data from the fighters table
UPDATE `serialized_gear_fighter`
SET `fighters_team_id` = (
  SELECT `team_id` 
  FROM `fighters` 
  WHERE `fighters`.`id` = `serialized_gear_fighter`.`fighter_id`
);

-- Step 3: SQLite doesn't support adding NOT NULL constraint after creation
-- So we need to verify the data is populated (handled by the UPDATE above)
-- The NOT NULL constraint will be enforced by the schema going forward