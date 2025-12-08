/*
  # Optimize RLS Policies and Function Security

  ## Performance Optimizations
  
  1. **RLS Policy Optimization**
     - All policies now use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of auth.uid() for each row
     - Significantly improves query performance at scale
  
  2. **Function Security**
     - Fixed `update_updated_at_column` function to have stable search_path
     - Prevents potential security vulnerabilities from search path manipulation
  
  ## Changes Made
  
  ### Projects Table Policies
  - Recreated all 4 policies (SELECT, INSERT, UPDATE, DELETE) with optimized auth check
  
  ### Scrapes Table Policies
  - Recreated all 4 policies (SELECT, INSERT, UPDATE, DELETE) with optimized auth check
  
  ### Headings Table Policies
  - Recreated all 4 policies with optimized auth check in EXISTS subquery
  
  ### Links Table Policies
  - Recreated all 4 policies with optimized auth check in EXISTS subquery
  
  ### AI Insights Table Policies
  - Recreated all 4 policies with optimized auth check in EXISTS subquery
  
  ## Security Notes
  
  - All security restrictions remain identical
  - Only performance characteristics have changed
  - No data access patterns are affected
*/

-- Drop existing policies for projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Recreate optimized policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop existing policies for scrapes
DROP POLICY IF EXISTS "Users can view their own scrapes" ON scrapes;
DROP POLICY IF EXISTS "Users can insert their own scrapes" ON scrapes;
DROP POLICY IF EXISTS "Users can update their own scrapes" ON scrapes;
DROP POLICY IF EXISTS "Users can delete their own scrapes" ON scrapes;

-- Recreate optimized policies for scrapes
CREATE POLICY "Users can view their own scrapes"
  ON scrapes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own scrapes"
  ON scrapes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own scrapes"
  ON scrapes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own scrapes"
  ON scrapes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop existing policies for headings
DROP POLICY IF EXISTS "Users can view headings of their scrapes" ON headings;
DROP POLICY IF EXISTS "Users can insert headings for their scrapes" ON headings;
DROP POLICY IF EXISTS "Users can update headings of their scrapes" ON headings;
DROP POLICY IF EXISTS "Users can delete headings of their scrapes" ON headings;

-- Recreate optimized policies for headings
CREATE POLICY "Users can view headings of their scrapes"
  ON headings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert headings for their scrapes"
  ON headings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update headings of their scrapes"
  ON headings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete headings of their scrapes"
  ON headings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = headings.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

-- Drop existing policies for links
DROP POLICY IF EXISTS "Users can view links of their scrapes" ON links;
DROP POLICY IF EXISTS "Users can insert links for their scrapes" ON links;
DROP POLICY IF EXISTS "Users can update links of their scrapes" ON links;
DROP POLICY IF EXISTS "Users can delete links of their scrapes" ON links;

-- Recreate optimized policies for links
CREATE POLICY "Users can view links of their scrapes"
  ON links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert links for their scrapes"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update links of their scrapes"
  ON links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete links of their scrapes"
  ON links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = links.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

-- Drop existing policies for ai_insights
DROP POLICY IF EXISTS "Users can view AI insights of their scrapes" ON ai_insights;
DROP POLICY IF EXISTS "Users can insert AI insights for their scrapes" ON ai_insights;
DROP POLICY IF EXISTS "Users can update AI insights of their scrapes" ON ai_insights;
DROP POLICY IF EXISTS "Users can delete AI insights of their scrapes" ON ai_insights;

-- Recreate optimized policies for ai_insights
CREATE POLICY "Users can view AI insights of their scrapes"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert AI insights for their scrapes"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update AI insights of their scrapes"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete AI insights of their scrapes"
  ON ai_insights FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scrapes
      WHERE scrapes.id = ai_insights.scrape_id
      AND scrapes.user_id = (select auth.uid())
    )
  );

-- Drop triggers before recreating function
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_scrapes_updated_at ON scrapes;

-- Drop and recreate function with fixed search path
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrapes_updated_at
  BEFORE UPDATE ON scrapes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();