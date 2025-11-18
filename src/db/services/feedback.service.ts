import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type FeedbackInsert = Database['public']['Tables']['feedback']['Insert']
type FeedbackRow = Database['public']['Tables']['feedback']['Row']
type FeedbackUpdate = Database['public']['Tables']['feedback']['Update']

export class FeedbackService {
  constructor(private supabase: SupabaseClient) {}

  async create(feedbackData: FeedbackInsert): Promise<FeedbackRow> {
    const { data, error } = await this.supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create feedback')
    }

    return data as FeedbackRow
  }

  async findById(id: number): Promise<FeedbackRow | null> {
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as FeedbackRow | null
  }

  async findByUserId(userId: number): Promise<FeedbackRow[]> {
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data as FeedbackRow[]
  }

  async update(id: number, updates: FeedbackUpdate): Promise<FeedbackRow> {
    const { data, error } = await this.supabase
      .from('feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update feedback')
    }

    return data as FeedbackRow
  }

  async findAll(limit?: number): Promise<FeedbackRow[]> {
    let query = this.supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data as FeedbackRow[]
  }
}

