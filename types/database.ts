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
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          title: string;
          description: string;
          min_players: number;
          max_players: number;
          duration_minutes: number;
          age_min: number;
          complexity: number;
          image_url: string | null;
          creator_id: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          min_players?: number;
          max_players?: number;
          duration_minutes?: number;
          age_min?: number;
          complexity?: number;
          image_url?: string | null;
          creator_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          min_players?: number;
          max_players?: number;
          duration_minutes?: number;
          age_min?: number;
          complexity?: number;
          image_url?: string | null;
          creator_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_rules: {
        Row: {
          id: string;
          game_id: string;
          content: Json;
          version: string;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          content?: Json;
          version?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          content?: Json;
          version?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scoring_systems: {
        Row: {
          id: string;
          game_id: string;
          name: string;
          config: Json;
          is_automated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          name: string;
          config?: Json;
          is_automated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          name?: string;
          config?: Json;
          is_automated?: boolean;
          created_at?: string;
        };
      };
      user_libraries: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          ownership_status: string;
          notes: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          ownership_status?: string;
          notes?: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          ownership_status?: string;
          notes?: string;
          added_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          game_id: string;
          host_id: string;
          scoring_system_id: string | null;
          started_at: string;
          ended_at: string | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          host_id: string;
          scoring_system_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          host_id?: string;
          scoring_system_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string;
          created_at?: string;
        };
      };
      session_players: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          guest_name: string | null;
          team_name: string | null;
          final_score: number;
          position: number | null;
          score_details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          guest_name?: string | null;
          team_name?: string | null;
          final_score?: number;
          position?: number | null;
          score_details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          guest_name?: string | null;
          team_name?: string | null;
          final_score?: number;
          position?: number | null;
          score_details?: Json;
          created_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_shares: {
        Row: {
          id: string;
          game_id: string;
          shared_by: string;
          shared_with: string | null;
          can_edit: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          shared_by: string;
          shared_with?: string | null;
          can_edit?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          shared_by?: string;
          shared_with?: string | null;
          can_edit?: boolean;
          created_at?: string;
        };
      };
      game_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
    };
  };
}
