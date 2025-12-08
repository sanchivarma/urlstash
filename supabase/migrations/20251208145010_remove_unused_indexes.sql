/*
  # Security and Performance Improvements

  ## Changes Made

  ### Remove Unused Indexes
  Dropping indexes that are not being used to:
  - Free up storage space
  - Reduce database maintenance overhead
  - Improve INSERT/UPDATE performance by reducing index maintenance costs
  
  ## Indexes Being Removed

  1. **headings table**
     - `idx_headings_order` - Composite index on (scrape_id, order_index)
     - `idx_headings_scrape_id` - Foreign key index on scrape_id
  
  2. **links table**
     - `idx_links_scrape_id` - Foreign key index on scrape_id
     - `idx_links_order` - Composite index on (scrape_id, order_index)
  
  3. **ai_insights table**
     - `idx_ai_insights_scrape_id` - Foreign key index on scrape_id
  
  4. **projects table**
     - `idx_projects_created_at` - Timestamp index for sorting
  
  5. **scrapes table**
     - `idx_scrapes_created_at` - Timestamp index for sorting
     - `idx_scrapes_url` - URL lookup index
     - `idx_scrapes_tags` - GIN index for array operations

  ## Indexes Being Kept

  The following indexes remain active as they support common query patterns:
  - `idx_projects_user_id` - Essential for RLS policies and user-based queries
  - `idx_scrapes_user_id` - Essential for RLS policies and user-based queries
  - `idx_scrapes_project_id` - Essential for project-based queries

  ## Performance Impact

  Positive impacts:
  - Faster INSERT/UPDATE operations (no unused index maintenance)
  - Reduced storage requirements
  - Simplified query optimizer decisions

  Note: If any of these indexes are needed in the future based on actual query patterns,
  they can be recreated with appropriate monitoring.
*/

-- Drop unused indexes on headings table
DROP INDEX IF EXISTS idx_headings_order;
DROP INDEX IF EXISTS idx_headings_scrape_id;

-- Drop unused indexes on links table
DROP INDEX IF EXISTS idx_links_scrape_id;
DROP INDEX IF EXISTS idx_links_order;

-- Drop unused indexes on ai_insights table
DROP INDEX IF EXISTS idx_ai_insights_scrape_id;

-- Drop unused indexes on projects table
DROP INDEX IF EXISTS idx_projects_created_at;

-- Drop unused indexes on scrapes table
DROP INDEX IF EXISTS idx_scrapes_created_at;
DROP INDEX IF EXISTS idx_scrapes_url;
DROP INDEX IF EXISTS idx_scrapes_tags;
