-- Add icon_name and icon_color columns to badges table
ALTER TABLE badges ADD COLUMN icon_name TEXT;
ALTER TABLE badges ADD COLUMN icon_color TEXT DEFAULT '#e11d48';
ALTER TABLE badges ALTER COLUMN icon_url DROP NOT NULL;
