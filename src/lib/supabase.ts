import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          role: 'victim' | 'volunteer' | 'org_admin' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          role?: 'victim' | 'volunteer' | 'org_admin' | 'admin'
        }
        Update: {
          name?: string | null
          phone?: string | null
          role?: 'victim' | 'volunteer' | 'org_admin' | 'admin'
        }
      }
      requests: {
        Row: {
          id: string
          title: string
          description: string | null
          category: 'Meals' | 'Water' | 'Equipment' | 'Shelter' | 'Medical' | 'Other'
          urgency: 'Low' | 'Medium' | 'High'
          status: 'Open' | 'Claimed' | 'Fulfilled'
          contact_name: string | null
          contact_phone: string | null
          is_contact_shared: boolean
          photo_urls: string[] | null
          exif_data: any[] | null
          gps_lat: number | null
          gps_lng: number | null
          photo_taken_time: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          claimed_by: string | null
        }
        Insert: {
          title: string
          description?: string | null
          category?: 'Meals' | 'Water' | 'Equipment' | 'Shelter' | 'Medical' | 'Other'
          urgency?: 'Low' | 'Medium' | 'High'
          contact_name?: string | null
          contact_phone?: string | null
          is_contact_shared?: boolean
          photo_urls?: string[] | null
          exif_data?: any[] | null
          gps_lat?: number | null
          gps_lng?: number | null
          photo_taken_time?: string | null
          created_by?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          category?: 'Meals' | 'Water' | 'Equipment' | 'Shelter' | 'Medical' | 'Other'
          urgency?: 'Low' | 'Medium' | 'High'
          status?: 'Open' | 'Claimed' | 'Fulfilled'
          contact_name?: string | null
          contact_phone?: string | null
          is_contact_shared?: boolean
          photo_urls?: string[] | null
          exif_data?: any[] | null
          gps_lat?: number | null
          gps_lng?: number | null
          photo_taken_time?: string | null
          claimed_by?: string | null
        }
      }
      offers: {
        Row: {
          id: string
          description: string
          category: string | null
          contact_name: string | null
          contact_phone: string | null
          gps_lat: number | null
          gps_lng: number | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          description: string
          category?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          created_by?: string | null
        }
        Update: {
          description?: string
          category?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
        }
      }
      zones: {
        Row: {
          id: string
          type: 'Starlink' | 'WiFi' | 'Church' | 'Shelter' | 'Fuel' | 'Other'
          description: string | null
          gps_lat: number | null
          gps_lng: number | null
          polygon: any | null
          contact_info: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          type?: 'Starlink' | 'WiFi' | 'Church' | 'Shelter' | 'Fuel' | 'Other'
          description?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          polygon?: any | null
          contact_info?: string | null
          created_by?: string | null
        }
        Update: {
          type?: 'Starlink' | 'WiFi' | 'Church' | 'Shelter' | 'Fuel' | 'Other'
          description?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          polygon?: any | null
          contact_info?: string | null
        }
      }
    }
  }
}
