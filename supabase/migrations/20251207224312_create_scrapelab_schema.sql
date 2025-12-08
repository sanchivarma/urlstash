/*
  # URLStash Database Schema

  This migration creates the complete database schema for URLStash, a web scraping and content organization platform.

  ## Tables Created

  1. **projects**
     - `id` (uuid, primary key) - Unique project identifier
     - `user_id` (uuid, foreign key) - Reference to auth.users
     - `name` (text) - Project name
     - `description` (text, nullable) - Optional project description
     - `created_at` (timestamptz) - Creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  2. **scrapes**
     - `id` (uuid, primary key) - Unique scrape identifier
     - `project_id` (uuid, foreign key) - Reference to projects table
     - `user_id` (uuid, foreign key) - Reference to auth.users
     - `url` (text) - The scraped URL
     - `page_title` (text) - Extracted page title
     - `meta_description` (text, nullable) - Extracted meta description
     - `favicon_url` (text, nullable) - Page favicon URL
     - `raw_content` (jsonb) - Raw Firecrawl response data
     - `notes` (text, nullable) - User's personal notes
     - `tags` (text[]) - User-defined tags
     - `created_at` (timestamptz) - Scrape timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  3. **headings**
     - `id` (uuid, primary key) - Unique heading identifier
     - `scrape_id` (uuid, foreign key) - Reference to scrapes table
     - `level` (integer) - Heading level (1 for H1, 2 for H2, etc.)
     - `text` (text) - Heading text content
     - `order_index` (integer) - Order of appearance on page

  4. **links**
     - `id` (uuid, primary key) - Unique link identifier
     - `scrape_id` (uuid, foreign key) - Reference to scrapes table
     - `url` (text) - Link URL
     - `anchor_text` (text) - Link anchor text
     - `is_external` (boolean) - Whether link is external
     - `order_index` (integer) - Order of appearance on page

  5. **ai_insights**
     - `id` (uuid, primary key) - Unique insight identifier
     - `scrape_id` (uuid, foreign key) - Reference to scrapes table
     - `summary_short` (text) - Brief summary (1-2 sentences)
     - `summary_long` (text, nullable) - Detailed summary (2-4 paragraphs)
     - `tags` (text[]) - AI-generated tags/keywords
     - `key_points` (jsonb) - Structured key takeaways
     - `created_at` (timestamptz) - Generation timestamp

  ## Security

  - Row Level Security (RLS) is enabled on all tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations
  - Cascading deletes ensure data integrity

  ## Indexes

  - Created on foreign keys for optimal query performance
  - Created on commonly searched fields (url, tags, created_at)
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create scrapes table
CREATE TABLE IF NOT EXISTS scrapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  page_title text NOT NULL,
  meta_description text,
  favicon_url text,
  raw_content jsonb DEFAULT '{}'::jsonb NOT NULL,
  notes text,
  tags text[] DEFAULT ARRAY[]::text[] NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create headings table
CREATE TABLE IF NOT EXISTS headings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_id uuid REFERENCES scrapes(id) ON DELETE CASCADE NOT NULL,
  level integer NOT NULL CHECK (level >= 1 AND level <= 6),
  text text NOT NULL,
  order_index integer NOT NULL
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_id uuid REFERENCES scrapes(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  anchor_text text NOT NULL,
  is_external boolean DEFAULT false NOT NULL,
  order_index integer NOT NULL
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_id uuid REFERENCES scrapes(id) ON DELETE CASCADE NOT NULL,
  summary_short text NOT NULL,
  summary_long text,
  tags text[] DEFAULT ARRAY[]::text[] NOT NULL,
  key_points jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scrapes_user_id ON scrapes(user_id);
CREATE INDEX IF NOT EXISTS idx_scrapes_project_id ON scrapes(project_id);
CREATE INDEX IF NOT EXISTS idx_scrapes_created_at ON scrapes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrapes_url ON scrapes(url);
CREATE INDEX IF NOT EXISTS idx_scrapes_tags ON scrapes USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_headings_scrape_id ON headings(scrape_id);
CREATE INDEX IF NOT EXISTS idx_headings_order ON headings(scrape_id, order_index);

CREATE INDEX IF NOT EXISTS idx_links_scrape_id ON links(scrape_id);
CREATE INDEX IF NOT EXISTS idx_links_order ON links(scrape_id, order_index);

CREATE INDEX IF NOT EXISTS idx_ai_insights_scrape_id ON ai_insights(scrape_id);

-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE headings ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for scrapes table
CREATE POLICY "Users can view their own scrapes"
  ON scrapes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scrapes"
  ON scrapes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrapes"
  ON scrapes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrapes"
  ON scrapes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for headings table
CREATE POLICY "Users can view headings of their scrapes"
  ON headings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert headings for their scrapes"
  ON headings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update headings of their scrapes"
  ON headings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete headings of their scrapes"
  ON headings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- RLS Policies for links table
CREATE POLICY "Users can view links of their scrapes"
  ON links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert links for their scrapes"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update links of their scrapes"
  ON links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links of their scrapes"
  ON links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_insights table
CREATE POLICY "Users can view AI insights of their scrapes"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert AI insights for their scrapes"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update AI insights of their scrapes"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete AI insights of their scrapes"
  ON ai_insights FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrapes_updated_at
  BEFORE UPDATE ON scrapes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();