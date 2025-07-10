/*
  # Create Dire-Chat Schema

  1. New Tables
    - `channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, optional)
      - `created_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `user_email` (text)
      - `channel_id` (uuid, references channels)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and write messages
    - Add policies for users to read and create channels
*/

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for channels
CREATE POLICY "Anyone can read channels"
  ON channels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create channels"
  ON channels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for messages
CREATE POLICY "Anyone can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default channels
INSERT INTO channels (name, description) VALUES 
  ('general', 'General discussion'),
  ('random', 'Random conversations'),
  ('tech', 'Technology discussions')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);