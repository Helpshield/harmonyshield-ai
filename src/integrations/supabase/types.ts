export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string
          id: string
          session_id: string | null
          test_id: string | null
          user_id: string | null
          variant: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          session_id?: string | null
          test_id?: string | null
          user_id?: string | null
          variant: string
        }
        Update: {
          assigned_at?: string
          id?: string
          session_id?: string | null
          test_id?: string | null
          user_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          traffic_split: Json
          updated_at: string
          variants: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          traffic_split?: Json
          updated_at?: string
          variants?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          traffic_split?: Json
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      biometric_settings: {
        Row: {
          auto_lock_timeout: number | null
          backup_methods: Json | null
          created_at: string
          device_fingerprints: Json | null
          enrollment_date: string | null
          face_id_enabled: boolean
          fingerprint_enabled: boolean
          id: string
          last_used: string | null
          require_biometric_for_sensitive: boolean
          security_level: string
          updated_at: string
          user_id: string
          voice_recognition_enabled: boolean
        }
        Insert: {
          auto_lock_timeout?: number | null
          backup_methods?: Json | null
          created_at?: string
          device_fingerprints?: Json | null
          enrollment_date?: string | null
          face_id_enabled?: boolean
          fingerprint_enabled?: boolean
          id?: string
          last_used?: string | null
          require_biometric_for_sensitive?: boolean
          security_level?: string
          updated_at?: string
          user_id: string
          voice_recognition_enabled?: boolean
        }
        Update: {
          auto_lock_timeout?: number | null
          backup_methods?: Json | null
          created_at?: string
          device_fingerprints?: Json | null
          enrollment_date?: string | null
          face_id_enabled?: boolean
          fingerprint_enabled?: boolean
          id?: string
          last_used?: string | null
          require_biometric_for_sensitive?: boolean
          security_level?: string
          updated_at?: string
          user_id?: string
          voice_recognition_enabled?: boolean
        }
        Relationships: []
      }
      bot_packages: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      deep_search_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          image_urls: string[] | null
          search_metadata: Json | null
          search_query: string | null
          search_status: string
          search_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          image_urls?: string[] | null
          search_metadata?: Json | null
          search_query?: string | null
          search_status?: string
          search_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          image_urls?: string[] | null
          search_metadata?: Json | null
          search_query?: string | null
          search_status?: string
          search_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deep_search_results: {
        Row: {
          confidence_score: number | null
          content: string | null
          created_at: string
          description: string | null
          fake_profile_indicators: string[] | null
          fraud_risk_score: number | null
          id: string
          image_urls: string[] | null
          metadata: Json | null
          relevance_score: number | null
          result_type: string
          search_request_id: string
          social_media_analysis: Json | null
          source_name: string
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          description?: string | null
          fake_profile_indicators?: string[] | null
          fraud_risk_score?: number | null
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          relevance_score?: number | null
          result_type: string
          search_request_id: string
          social_media_analysis?: Json | null
          source_name: string
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          description?: string | null
          fake_profile_indicators?: string[] | null
          fraud_risk_score?: number | null
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          relevance_score?: number | null
          result_type?: string
          search_request_id?: string
          social_media_analysis?: Json | null
          source_name?: string
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deep_search_results_search_request_id_fkey"
            columns: ["search_request_id"]
            isOneToOne: false
            referencedRelation: "deep_search_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string | null
          category: string
          content: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          published_at: string
          severity: string
          source_name: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          author?: string | null
          category: string
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          published_at: string
          severity: string
          source_name: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          published_at?: string
          severity?: string
          source_name?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_ip_address: unknown | null
          location: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_ip_address?: unknown | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_ip_address?: unknown | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          browser_info: Json | null
          created_at: string
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auth: string
          browser_info?: Json | null
          created_at?: string
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          browser_info?: Json | null
          created_at?: string
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recovery_requests: {
        Row: {
          admin_notes: string | null
          amount_lost: number | null
          assigned_admin_id: string | null
          bank_details: Json | null
          blockchain_network: string | null
          card_details: Json | null
          contact_details: Json | null
          contact_method: string | null
          created_at: string
          currency: string | null
          description: string
          evidence_files: string[] | null
          id: string
          incident_date: string | null
          last_four_digits: string | null
          progress_updates: Json | null
          recovery_type: Database["public"]["Enums"]["recovery_type"]
          status: Database["public"]["Enums"]["recovery_status"]
          title: string
          transaction_hash: string | null
          transaction_reference: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_lost?: number | null
          assigned_admin_id?: string | null
          bank_details?: Json | null
          blockchain_network?: string | null
          card_details?: Json | null
          contact_details?: Json | null
          contact_method?: string | null
          created_at?: string
          currency?: string | null
          description: string
          evidence_files?: string[] | null
          id?: string
          incident_date?: string | null
          last_four_digits?: string | null
          progress_updates?: Json | null
          recovery_type: Database["public"]["Enums"]["recovery_type"]
          status?: Database["public"]["Enums"]["recovery_status"]
          title: string
          transaction_hash?: string | null
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_lost?: number | null
          assigned_admin_id?: string | null
          bank_details?: Json | null
          blockchain_network?: string | null
          card_details?: Json | null
          contact_details?: Json | null
          contact_method?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          evidence_files?: string[] | null
          id?: string
          incident_date?: string | null
          last_four_digits?: string | null
          progress_updates?: Json | null
          recovery_type?: Database["public"]["Enums"]["recovery_type"]
          status?: Database["public"]["Enums"]["recovery_status"]
          title?: string
          transaction_hash?: string | null
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      scam_database: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          financial_impact: number | null
          id: string
          is_active: boolean
          last_verified: string
          platform_name: string
          platform_url: string
          reported_date: string
          scam_type: string
          source_name: string
          tags: string[] | null
          threat_level: string
          updated_at: string
          victim_count: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          financial_impact?: number | null
          id?: string
          is_active?: boolean
          last_verified?: string
          platform_name: string
          platform_url: string
          reported_date?: string
          scam_type?: string
          source_name?: string
          tags?: string[] | null
          threat_level?: string
          updated_at?: string
          victim_count?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          financial_impact?: number | null
          id?: string
          is_active?: boolean
          last_verified?: string
          platform_name?: string
          platform_url?: string
          reported_date?: string
          scam_type?: string
          source_name?: string
          tags?: string[] | null
          threat_level?: string
          updated_at?: string
          victim_count?: number | null
        }
        Relationships: []
      }
      scam_reports: {
        Row: {
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          platform: string | null
          reported_url: string | null
          scam_type: string | null
          severity: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          platform?: string | null
          reported_url?: string | null
          scam_type?: string | null
          severity?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          platform?: string | null
          reported_url?: string | null
          scam_type?: string | null
          severity?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_results: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          openai_analysis: Json | null
          overall_score: number | null
          recommendations: string[] | null
          risk_level: string | null
          scan_status: string
          scan_type: string
          target_content: string
          updated_at: string
          user_id: string
          virustotal_results: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          openai_analysis?: Json | null
          overall_score?: number | null
          recommendations?: string[] | null
          risk_level?: string | null
          scan_status?: string
          scan_type: string
          target_content: string
          updated_at?: string
          user_id: string
          virustotal_results?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          openai_analysis?: Json | null
          overall_score?: number | null
          recommendations?: string[] | null
          risk_level?: string | null
          scan_status?: string
          scan_type?: string
          target_content?: string
          updated_at?: string
          user_id?: string
          virustotal_results?: Json | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          processing_time_ms: number | null
          query_length: number | null
          results_count: number | null
          search_type: string
          success: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          query_length?: number | null
          results_count?: number | null
          search_type: string
          success?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          query_length?: number | null
          results_count?: number | null
          search_type?: string
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      threat_indicators: {
        Row: {
          confidence_level: number | null
          created_at: string
          id: string
          indicator_type: string
          indicator_value: string
          metadata: Json | null
          threat_report_id: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          id?: string
          indicator_type: string
          indicator_value: string
          metadata?: Json | null
          threat_report_id?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          id?: string
          indicator_type?: string
          indicator_value?: string
          metadata?: Json | null
          threat_report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threat_indicators_threat_report_id_fkey"
            columns: ["threat_report_id"]
            isOneToOne: false
            referencedRelation: "threat_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_reports: {
        Row: {
          affected_systems: string[] | null
          created_at: string
          description: string | null
          detection_methods: string[] | null
          first_detected_at: string
          id: string
          last_updated_at: string
          metadata: Json | null
          recommendations: string[] | null
          resolved_at: string | null
          severity: string
          source_data: Json | null
          status: string
          threat_score: number | null
          threat_type: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string[] | null
          created_at?: string
          description?: string | null
          detection_methods?: string[] | null
          first_detected_at?: string
          id?: string
          last_updated_at?: string
          metadata?: Json | null
          recommendations?: string[] | null
          resolved_at?: string | null
          severity?: string
          source_data?: Json | null
          status?: string
          threat_score?: number | null
          threat_type: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string[] | null
          created_at?: string
          description?: string | null
          detection_methods?: string[] | null
          first_detected_at?: string
          id?: string
          last_updated_at?: string
          metadata?: Json | null
          recommendations?: string[] | null
          resolved_at?: string | null
          severity?: string
          source_data?: Json | null
          status?: string
          threat_score?: number | null
          threat_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracking_links: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          short_code: string
          target_url: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          short_code: string
          target_url?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          short_code?: string
          target_url?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_hash: string
          api_key_prefix: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          last_used: string | null
          permissions: Json
          rate_limit_per_hour: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_hash: string
          api_key_prefix: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          last_used?: string | null
          permissions?: Json
          rate_limit_per_hour?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_hash?: string
          api_key_prefix?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used?: string | null
          permissions?: Json
          rate_limit_per_hour?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bot_subscriptions: {
        Row: {
          bot_package_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string
          stripe_subscription_id: string | null
          subscription_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bot_package_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          subscription_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bot_package_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          subscription_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bot_subscriptions_bot_package_id_fkey"
            columns: ["bot_package_id"]
            isOneToOne: false
            referencedRelation: "bot_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preferences_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          browser_info: Json | null
          created_at: string
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_accessed_at: string | null
          location_data: Json | null
          session_token: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          location_data?: Json | null
          session_token: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          location_data?: Json | null
          session_token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visitor_data: {
        Row: {
          browser_info: Json | null
          captured_image_url: string | null
          device_info: Json | null
          fingerprint_hash: string | null
          id: string
          ip_address: unknown | null
          location_data: Json | null
          referer: string | null
          tracking_link_id: string
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          browser_info?: Json | null
          captured_image_url?: string | null
          device_info?: Json | null
          fingerprint_hash?: string | null
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          referer?: string | null
          tracking_link_id: string
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          browser_info?: Json | null
          captured_image_url?: string | null
          device_info?: Json | null
          fingerprint_hash?: string | null
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          referer?: string | null
          tracking_link_id?: string
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_data_tracking_link_id_fkey"
            columns: ["tracking_link_id"]
            isOneToOne: false
            referencedRelation: "tracking_links"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          count: number | null
          date: string | null
          metric_type: string | null
          success_rate: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      recovery_status:
        | "pending"
        | "investigating"
        | "in_progress"
        | "completed"
        | "closed"
      recovery_type: "cash" | "cards" | "crypto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      recovery_status: [
        "pending",
        "investigating",
        "in_progress",
        "completed",
        "closed",
      ],
      recovery_type: ["cash", "cards", "crypto"],
    },
  },
} as const
