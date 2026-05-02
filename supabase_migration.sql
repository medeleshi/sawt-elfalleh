-- Add user_status enum and status column to profiles

CREATE TYPE user_status AS ENUM ('active', 'suspended');

ALTER TABLE profiles
ADD COLUMN status user_status NOT NULL DEFAULT 'active';
