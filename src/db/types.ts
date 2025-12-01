export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          telegram_id: number
          username: string | null
          first_name: string | null
          last_name: string | null
          language_code: string | null
          created_at: string
          updated_at: string
          customer_id: string | null
          credit: number
          analyzing_status: boolean | null
        }
        Insert: {
          id?: number
          telegram_id: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          language_code?: string | null
          created_at?: string
          updated_at?: string
          customer_id?: string | null
          credit?: number
          analyzing_status?: boolean | null
        }
        Update: {
          id?: number
          telegram_id?: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          language_code?: string | null
          created_at?: string
          updated_at?: string
          customer_id?: string | null
          credit?: number
          analyzing_status?: boolean | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: number
          user_id: number
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          credits: number
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          currency: string
          credits: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          credits?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      credit_usage: {
        Row: {
          id: number
          user_id: number
          essay_upload_id: number | null
          credits_used: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          essay_upload_id?: number | null
          credits_used: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          essay_upload_id?: number | null
          credits_used?: number
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_usage_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_usage_essay_upload_id_fkey'
            columns: ['essay_upload_id']
            isOneToOne: false
            referencedRelation: 'essay_uploads'
            referencedColumns: ['id']
          },
        ]
      }
      essay_uploads: {
        Row: {
          id: number
          user_id: number
          file_name: string
          file_size: number
          file_path: string
          mime_type: string | null
          status: 'queued' | 'processing' | 'completed'
          payment_status: 'not_paid' | 'paid' | 'failed'
          payment_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          file_name: string
          file_size: number
          file_path: string
          mime_type?: string | null
          status: 'queued' | 'processing' | 'completed'
          payment_status: 'not_paid' | 'paid' | 'failed'
          payment_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          file_name?: string
          file_size?: number
          file_path?: string
          mime_type?: string | null
          status?: 'queued' | 'processing' | 'completed'
          payment_status?: 'not_paid' | 'paid' | 'failed'
          payment_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'essay_uploads_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      feedback: {
        Row: {
          id: number
          user_id: number
          rating: 'good' | 'bad'
          message: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          rating: 'good' | 'bad'
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          rating?: 'good' | 'bad'
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string | null
          status: boolean | null
          note: string | null
          updated_at: string | null
          description: string | null
          service_button_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string | null
          status?: boolean | null
          note?: string | null
          updated_at?: string | null
          description?: string | null
          service_button_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string | null
          status?: boolean | null
          note?: string | null
          updated_at?: string | null
          description?: string | null
          service_button_id?: string | null
        }
        Relationships: []
      }
      originality_api_logs: {
        Row: {
          id: number
          user_id: number
          essay_upload_id: number | null
          word_count: number
          credits_used: number
          request_data: Json | null
          response_data: Json | null
          ai_score: number | null
          ai_confidence: number | null
          public_link: string | null
          scan_id: string | null
          status: 'pending' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          essay_upload_id?: number | null
          word_count: number
          credits_used: number
          request_data?: Json | null
          response_data?: Json | null
          ai_score?: number | null
          ai_confidence?: number | null
          public_link?: string | null
          scan_id?: string | null
          status?: 'pending' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          essay_upload_id?: number | null
          word_count?: number
          credits_used?: number
          request_data?: Json | null
          response_data?: Json | null
          ai_score?: number | null
          ai_confidence?: number | null
          public_link?: string | null
          scan_id?: string | null
          status?: 'pending' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'originality_api_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'originality_api_logs_essay_upload_id_fkey'
            columns: ['essay_upload_id']
            isOneToOne: false
            referencedRelation: 'essay_uploads'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
