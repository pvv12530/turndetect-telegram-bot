import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type CreditUsageInsert = Database['public']['Tables']['credit_usage']['Insert']
type CreditUsageRow = Database['public']['Tables']['credit_usage']['Row']

export class CreditUsageService {
  constructor(private supabase: SupabaseClient) {}

  async create(usageData: CreditUsageInsert): Promise<CreditUsageRow> {
    const { data, error } = await this.supabase
      .from('credit_usage')
      .insert(usageData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create credit usage record')
    }

    return data as CreditUsageRow
  }

  async findByUserId(userId: number, limit = 50): Promise<CreditUsageRow[]> {
    const { data, error } = await this.supabase
      .from('credit_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data as CreditUsageRow[]
  }

  async findByUploadId(uploadId: number): Promise<CreditUsageRow | null> {
    const { data, error } = await this.supabase
      .from('credit_usage')
      .select('*')
      .eq('essay_upload_id', uploadId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as CreditUsageRow | null
  }
}
