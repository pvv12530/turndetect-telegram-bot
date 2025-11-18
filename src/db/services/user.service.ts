import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type UserInsert = Database['public']['Tables']['users']['Insert']
type UserRow = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']

export class UserService {
  constructor(private supabase: SupabaseClient) {}

  async findByTelegramId(telegramId: number): Promise<UserRow | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as UserRow | null
  }

  async findById(id: number): Promise<UserRow | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as UserRow | null
  }

  async create(userData: UserInsert): Promise<UserRow> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create user')
    }

    return data as UserRow
  }

  async upsert(userData: UserInsert): Promise<UserRow> {
    const existing = await this.findByTelegramId(userData.telegram_id)

    if (existing) {
      const { data, error } = await this.supabase
        .from('users')
        .update({
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          language_code: userData.language_code,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', userData.telegram_id)
        .select()
        .single()

      if (error || !data) {
        throw error || new Error('Failed to update user')
      }

      return data as UserRow
    }
    else {
      return this.create(userData)
    }
  }

  async updateCustomerId(userId: number, customerId: string): Promise<UserRow> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update customer ID')
    }

    return data as UserRow
  }

  async addCredit(userId: number, credits: number): Promise<UserRow> {
    const user = await this.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const newCredit = (Number(user.credit) || 0) + credits

    const { data, error } = await this.supabase
      .from('users')
      .update({
        credit: newCredit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to add credit')
    }

    return data as UserRow
  }

  async deductCredit(userId: number, credits: number): Promise<UserRow> {
    const user = await this.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const currentCredit = Number(user.credit) || 0
    if (currentCredit < credits) {
      throw new Error('Insufficient credit')
    }

    const newCredit = currentCredit - credits

    const { data, error } = await this.supabase
      .from('users')
      .update({
        credit: newCredit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to deduct credit')
    }

    return data as UserRow
  }

  async update(userId: number, updates: UserUpdate): Promise<UserRow> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update user')
    }

    return data as UserRow
  }
}
