export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scrapes: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          url: string;
          page_title: string;
          meta_description: string | null;
          favicon_url: string | null;
          raw_content: Json;
          notes: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          url: string;
          page_title: string;
          meta_description?: string | null;
          favicon_url?: string | null;
          raw_content?: Json;
          notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          url?: string;
          page_title?: string;
          meta_description?: string | null;
          favicon_url?: string | null;
          raw_content?: Json;
          notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      headings: {
        Row: {
          id: string;
          scrape_id: string;
          level: number;
          text: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          scrape_id: string;
          level: number;
          text: string;
          order_index: number;
        };
        Update: {
          id?: string;
          scrape_id?: string;
          level?: number;
          text?: string;
          order_index?: number;
        };
      };
      links: {
        Row: {
          id: string;
          scrape_id: string;
          url: string;
          anchor_text: string;
          is_external: boolean;
          order_index: number;
        };
        Insert: {
          id?: string;
          scrape_id: string;
          url: string;
          anchor_text: string;
          is_external?: boolean;
          order_index: number;
        };
        Update: {
          id?: string;
          scrape_id?: string;
          url?: string;
          anchor_text?: string;
          is_external?: boolean;
          order_index?: number;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          scrape_id: string;
          summary_short: string;
          summary_long: string | null;
          tags: string[];
          key_points: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          scrape_id: string;
          summary_short: string;
          summary_long?: string | null;
          tags?: string[];
          key_points?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          scrape_id?: string;
          summary_short?: string;
          summary_long?: string | null;
          tags?: string[];
          key_points?: Json;
          created_at?: string;
        };
      };
    };
  };
}
