import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceUpdate = Database['public']['Tables']['services']['Update']

export class ServiceService {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return data as ServiceRow[]
  }

  async findById(id: string): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as ServiceRow | null
  }

  async findByButtonId(buttonId: string): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('service_button_id', buttonId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as ServiceRow | null
  }

  async create(serviceData: ServiceInsert): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create service')
    }

    return data as ServiceRow
  }

  async update(id: string, updates: ServiceUpdate): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update service')
    }

    return data as ServiceRow
  }

  async updateByName(name: string, updates: ServiceUpdate): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('name', name)
      .select()
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as ServiceRow | null
  }
}
