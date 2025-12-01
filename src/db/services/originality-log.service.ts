import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type OriginalityLogInsert = Database['public']['Tables']['originality_api_logs']['Insert']
type OriginalityLogRow = Database['public']['Tables']['originality_api_logs']['Row']
type OriginalityLogUpdate = Database['public']['Tables']['originality_api_logs']['Update']

export class OriginalityLogService {
  constructor(private supabase: SupabaseClient) {}

  async create(logData: OriginalityLogInsert): Promise<OriginalityLogRow> {
    const { data, error } = await this.supabase
      .from('originality_api_logs')
      .insert(logData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create originality log')
    }

    return data as OriginalityLogRow
  }

  async findById(id: number): Promise<OriginalityLogRow | null> {
    const { data, error } = await this.supabase
      .from('originality_api_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as OriginalityLogRow | null
  }

  async findByUploadId(uploadId: number): Promise<OriginalityLogRow | null> {
    const { data, error } = await this.supabase
      .from('originality_api_logs')
      .select('*')
      .eq('essay_upload_id', uploadId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as OriginalityLogRow | null
  }

  async update(id: number, updates: OriginalityLogUpdate): Promise<OriginalityLogRow> {
    const { data, error } = await this.supabase
      .from('originality_api_logs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update originality log')
    }

    return data as OriginalityLogRow
  }
}
