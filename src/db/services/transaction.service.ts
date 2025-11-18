import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionRow = Database['public']['Tables']['transactions']['Row']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export class TransactionService {
  constructor(private supabase: SupabaseClient) {}

  async create(transactionData: TransactionInsert): Promise<TransactionRow> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create transaction')
    }

    return data as TransactionRow
  }

  async findBySessionId(sessionId: string): Promise<TransactionRow | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as TransactionRow | null
  }

  async update(transactionId: number, updates: TransactionUpdate): Promise<TransactionRow> {
    const { data, error } = await this.supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update transaction')
    }

    return data as TransactionRow
  }

  async findByUserId(userId: number, limit = 10): Promise<TransactionRow[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data as TransactionRow[]
  }
}
