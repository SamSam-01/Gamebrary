/*
  # Core Schema for Board Game Community App

  ## Overview
  This migration creates the foundational database structure for a community-driven board game management application.

  ## New Tables

  ### 1. profiles
  - User profile information linked to auth.users
  - username, avatar_url, bio, timestamps

  ### 2. game_categories
  - Predefined categories for games
  - name, slug (unique identifier)

  ### 3. games
  - Core game information
  - title, description, player count, duration, complexity
  - creator_id, is_public flag

  ### 4. game_category_links
  - Many-to-many relationship between games and categories

  ### 5. game_rules
  - Structured rules content for each game
  - content (jsonb), version, language

  ### 6. scoring_systems
  - Configurable scoring systems for games
  - name, config (jsonb), is_automated flag

  ### 7. user_libraries
  - User's personal game collection
  - ownership_status (owned, wishlist, borrowed)

  ### 8. game_sessions
  - Game play sessions
  - host_id, scoring_system_id, timestamps

  ### 9. session_players
  - Players in each session
  - user_id (nullable for guests), scores, rankings

  ### 10. friendships
  - Social connections between users
  - status (pending, accepted, blocked)

  ### 11. game_shares
  - Game sharing permissions
  - shared_by, shared_with, can_edit flag

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data or public/shared content
  - Authenticated access required
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create game_categories table
CREATE TABLE IF NOT EXISTS game_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON game_categories FOR SELECT
  TO authenticated
  USING (true);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  min_players int DEFAULT 2,
  max_players int DEFAULT 4,
  duration_minutes int DEFAULT 60,
  age_min int DEFAULT 8,
  complexity int DEFAULT 3 CHECK (complexity BETWEEN 1 AND 5),
  image_url text,
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can insert own games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update own games"
  ON games FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can delete own games"
  ON games FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create game_category_links table
CREATE TABLE IF NOT EXISTS game_category_links (
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  category_id uuid REFERENCES game_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, category_id)
);

ALTER TABLE game_category_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view category links for accessible games"
  ON game_category_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_category_links.game_id
      AND (games.creator_id = auth.uid() OR games.is_public = true)
    )
  );

CREATE POLICY "Users can manage category links for own games"
  ON game_category_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_category_links.game_id
      AND games.creator_id = auth.uid()
    )
  );

-- Create game_rules table
CREATE TABLE IF NOT EXISTS game_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  version text DEFAULT '1.0',
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rules for accessible games"
  ON game_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_rules.game_id
      AND (games.creator_id = auth.uid() OR games.is_public = true)
    )
  );

CREATE POLICY "Users can manage rules for own games"
  ON game_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_rules.game_id
      AND games.creator_id = auth.uid()
    )
  );

-- Create scoring_systems table
CREATE TABLE IF NOT EXISTS scoring_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  is_automated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scoring_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scoring systems for accessible games"
  ON scoring_systems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = scoring_systems.game_id
      AND (games.creator_id = auth.uid() OR games.is_public = true)
    )
  );

CREATE POLICY "Users can manage scoring systems for own games"
  ON scoring_systems FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = scoring_systems.game_id
      AND games.creator_id = auth.uid()
    )
  );

-- Create user_libraries table
CREATE TABLE IF NOT EXISTS user_libraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  ownership_status text DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'wishlist', 'borrowed')),
  notes text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE user_libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own library"
  ON user_libraries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own library"
  ON user_libraries FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scoring_system_id uuid REFERENCES scoring_systems(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create session_players table BEFORE the game_sessions policies that reference it
CREATE TABLE IF NOT EXISTS session_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name text,
  team_name text,
  final_score numeric DEFAULT 0,
  position int,
  score_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;

-- Now create game_sessions policies
CREATE POLICY "Users can view sessions they participated in"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (
    host_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_players
      WHERE session_players.session_id = game_sessions.id
      AND session_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update own sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can delete own sessions"
  ON game_sessions FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- Create session_players policies
CREATE POLICY "Users can view players in accessible sessions"
  ON session_players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      WHERE game_sessions.id = session_players.session_id
      AND (
        game_sessions.host_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM session_players sp
          WHERE sp.session_id = game_sessions.id
          AND sp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Session hosts can manage players"
  ON session_players FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      WHERE game_sessions.id = session_players.session_id
      AND game_sessions.host_id = auth.uid()
    )
  );

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Create game_shares table
CREATE TABLE IF NOT EXISTS game_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with uuid REFERENCES profiles(id) ON DELETE CASCADE,
  can_edit boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares for own games or shared with them"
  ON game_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid() OR
    shared_with = auth.uid() OR
    shared_with IS NULL
  );

CREATE POLICY "Users can create shares for own games"
  ON game_shares FOR INSERT
  TO authenticated
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can update own shares"
  ON game_shares FOR UPDATE
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can delete own shares"
  ON game_shares FOR DELETE
  TO authenticated
  USING (shared_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_games_public ON games(is_public);
CREATE INDEX IF NOT EXISTS idx_game_rules_game ON game_rules(game_id);
CREATE INDEX IF NOT EXISTS idx_scoring_systems_game ON scoring_systems(game_id);
CREATE INDEX IF NOT EXISTS idx_user_libraries_user ON user_libraries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_libraries_game ON user_libraries(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host ON game_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_session_players_session ON session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_session_players_user ON session_players(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_game_shares_game ON game_shares(game_id);

-- Insert default categories
INSERT INTO game_categories (name, slug) VALUES
  ('Strategy', 'strategy'),
  ('Family', 'family'),
  ('Party', 'party'),
  ('Card Game', 'card-game'),
  ('Cooperative', 'cooperative'),
  ('Competitive', 'competitive'),
  ('Dice', 'dice'),
  ('Deck Building', 'deck-building'),
  ('Worker Placement', 'worker-placement'),
  ('Abstract', 'abstract')
ON CONFLICT (slug) DO NOTHING;