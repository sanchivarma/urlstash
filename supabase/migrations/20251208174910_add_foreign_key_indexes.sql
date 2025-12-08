/*
  # Add Foreign Key Indexes for Performance

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Creates indexes on foreign key columns to optimize query performance and joins.
  
  ## Indexes Being Added

  1. **ai_insights table**
     - `idx_ai_insights_scrape_id` - Index on scrape_id foreign key
     - Improves performance when querying AI insights by scrape
  
  2. **headings table**
     - `idx_headings_scrape_id` - Index on scrape_id foreign key
     - Improves performance when querying headings by scrape
  
  3. **links table**
     - `idx_links_scrape_id` - Index on scrape_id foreign key
     - Improves performance when querying links by scrape

  ## Performance Benefits

  - Faster JOIN operations between tables
  - Improved foreign key constraint checking
  - Better query performance for related data lookups
  - Reduced database load for common query patterns

  ## Note

  Foreign key columns should always have indexes to ensure optimal performance,
  especially when performing cascading operations or joining tables.
*/

-- Add index for ai_insights foreign key
CREATE INDEX IF NOT EXISTS idx_ai_insights_scrape_id ON ai_insights(scrape_id);

-- Add index for headings foreign key
CREATE INDEX IF NOT EXISTS idx_headings_scrape_id ON headings(scrape_id);

-- Add index for links foreign key
CREATE INDEX IF NOT EXISTS idx_links_scrape_id ON links(scrape_id);
