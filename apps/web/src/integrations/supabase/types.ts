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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_cm_appointments: {
        Row: {
          cm_user_id: string
          created_at: string
          duration_minutes: number
          id: string
          law_firm_id: string | null
          lawyer_user_id: string
          scheduled_at: string
          status: string
          type: string
        }
        Insert: {
          cm_user_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          law_firm_id?: string | null
          lawyer_user_id: string
          scheduled_at: string
          status?: string
          type: string
        }
        Update: {
          cm_user_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          law_firm_id?: string | null
          lawyer_user_id?: string
          scheduled_at?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_cm_appointments_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_internal_messages: {
        Row: {
          content: string
          context_id: string | null
          context_label: string | null
          context_type: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          is_urgent: boolean | null
          linked_firm_id: string | null
          recipient_id: string
          sender_id: string
          status: string
          tags: string[]
          thread_id: string | null
        }
        Insert: {
          content: string
          context_id?: string | null
          context_label?: string | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          linked_firm_id?: string | null
          recipient_id: string
          sender_id: string
          status?: string
          tags?: string[]
          thread_id?: string | null
        }
        Update: {
          content?: string
          context_id?: string | null
          context_label?: string | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          linked_firm_id?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string
          tags?: string[]
          thread_id?: string | null
        }
        Relationships: []
      }
      cm_activity_logs: {
        Row: {
          action_type: string
          cm_user_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          law_firm_id: string | null
        }
        Insert: {
          action_type: string
          cm_user_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          law_firm_id?: string | null
        }
        Update: {
          action_type?: string
          cm_user_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          law_firm_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_activity_logs_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_assignments: {
        Row: {
          assigned_by: string | null
          cm_user_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          law_firm_id: string | null
          lawyer_user_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          cm_user_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          law_firm_id?: string | null
          lawyer_user_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          cm_user_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          law_firm_id?: string | null
          lawyer_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_assignments_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          contact_count: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          list_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          created_at: string
          email: string
          firm_name: string | null
          firm_size: string
          full_name: string
          id: string
          message: string | null
          phone: string
          preferred_date: string
          preferred_time: string
          specialty: string
          status: string
          terms_accepted: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          firm_name?: string | null
          firm_size: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          preferred_date: string
          preferred_time: string
          specialty: string
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          firm_name?: string | null
          firm_size?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          preferred_date?: string
          preferred_time?: string
          specialty?: string
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          bounce_count: number
          clicked_count: number | null
          created_at: string
          id: string
          name: string
          opened_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          template_id: string | null
          total_recipients: number | null
          unsubscribe_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bounce_count?: number
          clicked_count?: number | null
          created_at?: string
          id?: string
          name: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          template_id?: string | null
          total_recipients?: number | null
          unsubscribe_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bounce_count?: number
          clicked_count?: number | null
          created_at?: string
          id?: string
          name?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          template_id?: string | null
          total_recipients?: number | null
          unsubscribe_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_recipients: {
        Row: {
          bounced_at: string | null
          campaign_id: string
          click_count: number
          clicked_at: string | null
          created_at: string
          email: string
          error_message: string | null
          id: string
          name: string | null
          opened_at: string | null
          sent_at: string | null
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id: string
          click_count?: number
          clicked_at?: string | null
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          name?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string
          click_count?: number
          clicked_at?: string | null
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          name?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          html_content: string | null
          id: string
          is_system_template: boolean | null
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          html_content?: string | null
          id?: string
          is_system_template?: boolean | null
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          html_content?: string | null
          id?: string
          is_system_template?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      google_business_connections: {
        Row: {
          access_token: string
          account_id: string | null
          connected_at: string
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          location_id: string | null
          location_name: string | null
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id?: string | null
          connected_at?: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          location_name?: string | null
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string | null
          connected_at?: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          location_name?: string | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_business_posts: {
        Row: {
          call_to_action_type: string | null
          call_to_action_url: string | null
          created_at: string
          event_end_date: string | null
          event_start_date: string | null
          event_title: string | null
          id: string
          media_url: string | null
          post_id: string | null
          post_type: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          call_to_action_type?: string | null
          call_to_action_url?: string | null
          created_at?: string
          event_end_date?: string | null
          event_start_date?: string | null
          event_title?: string | null
          id?: string
          media_url?: string | null
          post_id?: string | null
          post_type?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          summary: string
          updated_at?: string
          user_id: string
        }
        Update: {
          call_to_action_type?: string | null
          call_to_action_url?: string | null
          created_at?: string
          event_end_date?: string | null
          event_start_date?: string | null
          event_title?: string | null
          id?: string
          media_url?: string | null
          post_id?: string | null
          post_type?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_business_reviews: {
        Row: {
          comment: string | null
          create_time: string | null
          id: string
          reply_updated_at: string | null
          review_id: string
          review_reply: string | null
          reviewer_name: string | null
          reviewer_photo_url: string | null
          star_rating: number | null
          synced_at: string
          update_time: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          create_time?: string | null
          id?: string
          reply_updated_at?: string | null
          review_id: string
          review_reply?: string | null
          reviewer_name?: string | null
          reviewer_photo_url?: string | null
          star_rating?: number | null
          synced_at?: string
          update_time?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          create_time?: string | null
          id?: string
          reply_updated_at?: string | null
          review_id?: string
          review_reply?: string | null
          reviewer_name?: string | null
          reviewer_photo_url?: string | null
          star_rating?: number | null
          synced_at?: string
          update_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string
          law_firm_id: string | null
          pdf_url: string | null
          period_end: string
          period_start: string
          plan_name: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_number: string
          law_firm_id?: string | null
          pdf_url?: string | null
          period_end: string
          period_start: string
          plan_name?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          law_firm_id?: string | null
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          plan_name?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      judicial_events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          end_date: string | null
          id: string
          linked_trends: string[] | null
          sensitivity: string | null
          sensitivity_reason: string | null
          source: string | null
          speaking_guidance: string | null
          thematic: string
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          end_date?: string | null
          id?: string
          linked_trends?: string[] | null
          sensitivity?: string | null
          sensitivity_reason?: string | null
          source?: string | null
          speaking_guidance?: string | null
          thematic: string
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          end_date?: string | null
          id?: string
          linked_trends?: string[] | null
          sensitivity?: string | null
          sensitivity_reason?: string | null
          source?: string | null
          speaking_guidance?: string | null
          thematic?: string
          title?: string
        }
        Relationships: []
      }
      key_dates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          importance: string | null
          is_recurring: boolean | null
          month_day: string
          recommended_platforms: string[] | null
          speaking_opportunities: string[] | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          importance?: string | null
          is_recurring?: boolean | null
          month_day: string
          recommended_platforms?: string[] | null
          speaking_opportunities?: string[] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          importance?: string | null
          is_recurring?: boolean | null
          month_day?: string
          recommended_platforms?: string[] | null
          speaking_opportunities?: string[] | null
          title?: string
        }
        Relationships: []
      }
      law_firm_members: {
        Row: {
          can_validate: boolean | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          law_firm_id: string
          role: Database["public"]["Enums"]["sp_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_validate?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          law_firm_id: string
          role?: Database["public"]["Enums"]["sp_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_validate?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          law_firm_id?: string
          role?: Database["public"]["Enums"]["sp_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "law_firm_members_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      law_firms: {
        Row: {
          address: string | null
          bar_association: string | null
          city: string | null
          created_at: string | null
          editorial_tone: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          publication_frequency: string | null
          social_networks: string[] | null
          specialization_areas: string[] | null
          subscription_plan: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          bar_association?: string | null
          city?: string | null
          created_at?: string | null
          editorial_tone?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          publication_frequency?: string | null
          social_networks?: string[] | null
          specialization_areas?: string[] | null
          subscription_plan?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          bar_association?: string | null
          city?: string | null
          created_at?: string | null
          editorial_tone?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          publication_frequency?: string | null
          social_networks?: string[] | null
          specialization_areas?: string[] | null
          subscription_plan?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      lawyers: {
        Row: {
          address: string | null
          bar_association: string | null
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          linkedin_url: string | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          scraped_at: string
          source_url: string | null
          specializations: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bar_association?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          scraped_at?: string
          source_url?: string | null
          specializations?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bar_association?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          scraped_at?: string
          source_url?: string | null
          specializations?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      modification_requests: {
        Row: {
          created_at: string
          current_value: string | null
          field_name: string
          id: string
          justification: string
          law_firm_id: string | null
          rejection_reason: string | null
          request_type: string
          requested_value: string
          requester_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: string | null
          field_name: string
          id?: string
          justification: string
          law_firm_id?: string | null
          rejection_reason?: string | null
          request_type: string
          requested_value: string
          requester_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: string | null
          field_name?: string
          id?: string
          justification?: string
          law_firm_id?: string | null
          rejection_reason?: string | null
          request_type?: string
          requested_value?: string
          requester_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modification_requests_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          auto_validation_delay: string | null
          avatar_url: string | null
          bar_association: string | null
          bio: string | null
          cabinet_name: string | null
          city: string | null
          created_at: string
          dashboard_layout: Json | null
          email: string | null
          expiration_behavior:
            | Database["public"]["Enums"]["expiration_behavior"]
            | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          logo_url: string | null
          notification_new_proposals: boolean | null
          notification_reminders: boolean | null
          onboarding_complete: boolean | null
          phone: string | null
          postal_code: string | null
          role: string | null
          updated_at: string
          urgent_sla_hours: number | null
          user_id: string
          username: string | null
          validation_sla_hours: number | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          auto_validation_delay?: string | null
          avatar_url?: string | null
          bar_association?: string | null
          bio?: string | null
          cabinet_name?: string | null
          city?: string | null
          created_at?: string
          dashboard_layout?: Json | null
          email?: string | null
          expiration_behavior?:
            | Database["public"]["Enums"]["expiration_behavior"]
            | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          logo_url?: string | null
          notification_new_proposals?: boolean | null
          notification_reminders?: boolean | null
          onboarding_complete?: boolean | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          updated_at?: string
          urgent_sla_hours?: number | null
          user_id: string
          username?: string | null
          validation_sla_hours?: number | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          auto_validation_delay?: string | null
          avatar_url?: string | null
          bar_association?: string | null
          bio?: string | null
          cabinet_name?: string | null
          city?: string | null
          created_at?: string
          dashboard_layout?: Json | null
          email?: string | null
          expiration_behavior?:
            | Database["public"]["Enums"]["expiration_behavior"]
            | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          logo_url?: string | null
          notification_new_proposals?: boolean | null
          notification_reminders?: boolean | null
          onboarding_complete?: boolean | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          updated_at?: string
          urgent_sla_hours?: number | null
          user_id?: string
          username?: string | null
          validation_sla_hours?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      publication_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          publication_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          publication_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          publication_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_comments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_metrics: {
        Row: {
          audience_age: Json | null
          audience_gender: Json | null
          audience_location: Json | null
          clicks: number | null
          comments_count: number | null
          engagement_rate: number | null
          id: string
          likes: number | null
          peak_times: Json | null
          performance_level: string | null
          publication_id: string
          reach: number | null
          recorded_at: string | null
          shares: number | null
        }
        Insert: {
          audience_age?: Json | null
          audience_gender?: Json | null
          audience_location?: Json | null
          clicks?: number | null
          comments_count?: number | null
          engagement_rate?: number | null
          id?: string
          likes?: number | null
          peak_times?: Json | null
          performance_level?: string | null
          publication_id: string
          reach?: number | null
          recorded_at?: string | null
          shares?: number | null
        }
        Update: {
          audience_age?: Json | null
          audience_gender?: Json | null
          audience_location?: Json | null
          clicks?: number | null
          comments_count?: number | null
          engagement_rate?: number | null
          id?: string
          likes?: number | null
          peak_times?: Json | null
          performance_level?: string | null
          publication_id?: string
          reach?: number | null
          recorded_at?: string | null
          shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_metrics_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          image_url: string | null
          last_reminder_sent_at: string | null
          law_firm_id: string | null
          modification_request_comment: string | null
          parent_id: string | null
          platform: Database["public"]["Enums"]["social_platform"] | null
          priority: string | null
          published_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          reminder_count: number | null
          scheduled_date: string
          scheduled_time: string
          source: Database["public"]["Enums"]["publication_source"]
          status: Database["public"]["Enums"]["publication_status"]
          submitted_at: string | null
          title: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"] | null
          user_id: string
          validation_status:
            | Database["public"]["Enums"]["validation_extended_status"]
            | null
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          last_reminder_sent_at?: string | null
          law_firm_id?: string | null
          modification_request_comment?: string | null
          parent_id?: string | null
          platform?: Database["public"]["Enums"]["social_platform"] | null
          priority?: string | null
          published_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reminder_count?: number | null
          scheduled_date: string
          scheduled_time?: string
          source?: Database["public"]["Enums"]["publication_source"]
          status?: Database["public"]["Enums"]["publication_status"]
          submitted_at?: string | null
          title?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          user_id: string
          validation_status?:
            | Database["public"]["Enums"]["validation_extended_status"]
            | null
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          last_reminder_sent_at?: string | null
          law_firm_id?: string | null
          modification_request_comment?: string | null
          parent_id?: string | null
          platform?: Database["public"]["Enums"]["social_platform"] | null
          priority?: string | null
          published_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reminder_count?: number | null
          scheduled_date?: string
          scheduled_time?: string
          source?: Database["public"]["Enums"]["publication_source"]
          status?: Database["public"]["Enums"]["publication_status"]
          submitted_at?: string | null
          title?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          user_id?: string
          validation_status?:
            | Database["public"]["Enums"]["validation_extended_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          search_query: string | null
          search_type: string | null
          source_url: string
          started_at: string | null
          status: string
          total_found: number | null
          total_scraped: number | null
          urls_found: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          search_query?: string | null
          search_type?: string | null
          source_url: string
          started_at?: string | null
          status?: string
          total_found?: number | null
          total_scraped?: number | null
          urls_found?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          search_query?: string | null
          search_type?: string | null
          source_url?: string
          started_at?: string | null
          status?: string
          total_found?: number | null
          total_scraped?: number | null
          urls_found?: number | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          account_avatar_url: string | null
          account_email: string | null
          account_id: string | null
          account_name: string | null
          connected_at: string
          connection_status:
            | Database["public"]["Enums"]["connection_status"]
            | null
          connection_type: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          permissions: string[] | null
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          account_avatar_url?: string | null
          account_email?: string | null
          account_id?: string | null
          account_name?: string | null
          connected_at?: string
          connection_status?:
            | Database["public"]["Enums"]["connection_status"]
            | null
          connection_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          permissions?: string[] | null
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          account_avatar_url?: string | null
          account_email?: string | null
          account_id?: string | null
          account_name?: string | null
          connected_at?: string
          connection_status?:
            | Database["public"]["Enums"]["connection_status"]
            | null
          connection_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          permissions?: string[] | null
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      social_publish_logs: {
        Row: {
          created_at: string
          error_message: string | null
          external_post_id: string | null
          id: string
          platform: string
          publication_id: string | null
          published_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          platform: string
          publication_id?: string | null
          published_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          platform?: string
          publication_id?: string | null
          published_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_publish_logs_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      support_activity_logs: {
        Row: {
          action_type: string
          conversation_id: string | null
          created_at: string
          details: Json | null
          id: string
          new_value: string | null
          previous_value: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          conversation_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_value?: string | null
          previous_value?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          conversation_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_value?: string | null
          previous_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_activity_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          closed_at: string | null
          created_at: string | null
          expected_action: string | null
          id: string
          last_message_preview: string | null
          law_firm_name: string | null
          lawyer_name: string | null
          linked_publication_id: string | null
          reason: string
          request_type: string | null
          source: string | null
          status: string | null
          subject: string
          updated_at: string | null
          urgency: string | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          expected_action?: string | null
          id?: string
          last_message_preview?: string | null
          law_firm_name?: string | null
          lawyer_name?: string | null
          linked_publication_id?: string | null
          reason: string
          request_type?: string | null
          source?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          urgency?: string | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          expected_action?: string | null
          id?: string
          last_message_preview?: string | null
          law_firm_name?: string | null
          lawyer_name?: string | null
          linked_publication_id?: string | null
          reason?: string
          request_type?: string | null
          source?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_conversations_linked_publication_id_fkey"
            columns: ["linked_publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          ai_generated: boolean | null
          ai_suggested_actions: Json | null
          ai_summary: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_suggested_actions?: Json | null
          ai_summary?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_suggested_actions?: Json | null
          ai_summary?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      trends: {
        Row: {
          attention_level: string | null
          category: string
          created_at: string | null
          date: string | null
          description: string | null
          editorial_recommendation: string | null
          evolution: string | null
          id: string
          intensity: number | null
          peak_region: string | null
          platforms: string[] | null
          regions: string[] | null
          relevance: string | null
          title: string
          updated_at: string | null
          why_trending: string | null
        }
        Insert: {
          attention_level?: string | null
          category: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          editorial_recommendation?: string | null
          evolution?: string | null
          id?: string
          intensity?: number | null
          peak_region?: string | null
          platforms?: string[] | null
          regions?: string[] | null
          relevance?: string | null
          title: string
          updated_at?: string | null
          why_trending?: string | null
        }
        Update: {
          attention_level?: string | null
          category?: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          editorial_recommendation?: string | null
          evolution?: string | null
          id?: string
          intensity?: number | null
          peak_region?: string | null
          platforms?: string[] | null
          regions?: string[] | null
          relevance?: string | null
          title?: string
          updated_at?: string | null
          why_trending?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles_simple: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["simple_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["simple_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["simple_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles_v2: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["sp_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["sp_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["sp_role"]
          user_id?: string
        }
        Relationships: []
      }
      validation_audit_trail: {
        Row: {
          action: string
          comment: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          previous_status: string | null
          publication_id: string
          user_id: string
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          publication_id: string
          user_id: string
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          publication_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_audit_trail_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_expiration_time: {
        Args: { p_sla_hours: number; p_submitted_at: string }
        Returns: string
      }
      can_manage_content: { Args: { _user_id: string }; Returns: boolean }
      can_validate_content: { Args: { _user_id: string }; Returns: boolean }
      can_view_finance: { Args: { _user_id: string }; Returns: boolean }
      cm_can_access_publication: {
        Args: { _cm_user_id: string; _publication_user_id: string }
        Returns: boolean
      }
      cm_has_access_to_lawyer: {
        Args: { _cm_user_id: string; _lawyer_user_id: string }
        Returns: boolean
      }
      get_simple_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["simple_role"]
      }
      get_user_law_firms: { Args: { _user_id: string }; Returns: string[] }
      get_user_session_data: { Args: { _user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_simple_role: {
        Args: {
          _role: Database["public"]["Enums"]["simple_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_sp_role: {
        Args: {
          _role: Database["public"]["Enums"]["sp_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_internal_admin: { Args: { _user_id: string }; Returns: boolean }
      is_read_only_role: { Args: { _user_id: string }; Returns: boolean }
      is_same_law_firm: {
        Args: { _other_user_id: string; _user_id: string }
        Returns: boolean
      }
      is_simple_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_firm: {
        Args: { _law_firm_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      connection_status: "not_connected" | "ready" | "active"
      expiration_behavior: "do_not_publish" | "save_as_draft" | "auto_publish"
      publication_source: "manual" | "socialpulse"
      publication_status:
        | "brouillon"
        | "a_valider"
        | "programme"
        | "publie"
        | "refuse"
      simple_role: "admin" | "community_manager" | "lawyer"
      social_platform:
        | "linkedin"
        | "instagram"
        | "facebook"
        | "twitter"
        | "blog"
        | "google_business"
      sp_role:
        | "super_admin"
        | "finance"
        | "ops_admin"
        | "commercial"
        | "community_manager"
        | "lawyer"
        | "lawyer_assistant"
        | "support"
        | "demo_observer"
      urgency_level: "normal" | "urgent"
      validation_extended_status:
        | "draft"
        | "cm_review"
        | "submitted_to_lawyer"
        | "in_lawyer_review"
        | "validated"
        | "refused"
        | "modified_by_lawyer"
        | "expired"
        | "published"
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
      app_role: ["admin", "moderator", "user"],
      connection_status: ["not_connected", "ready", "active"],
      expiration_behavior: ["do_not_publish", "save_as_draft", "auto_publish"],
      publication_source: ["manual", "socialpulse"],
      publication_status: [
        "brouillon",
        "a_valider",
        "programme",
        "publie",
        "refuse",
      ],
      simple_role: ["admin", "community_manager", "lawyer"],
      social_platform: [
        "linkedin",
        "instagram",
        "facebook",
        "twitter",
        "blog",
        "google_business",
      ],
      sp_role: [
        "super_admin",
        "finance",
        "ops_admin",
        "commercial",
        "community_manager",
        "lawyer",
        "lawyer_assistant",
        "support",
        "demo_observer",
      ],
      urgency_level: ["normal", "urgent"],
      validation_extended_status: [
        "draft",
        "cm_review",
        "submitted_to_lawyer",
        "in_lawyer_review",
        "validated",
        "refused",
        "modified_by_lawyer",
        "expired",
        "published",
      ],
    },
  },
} as const
