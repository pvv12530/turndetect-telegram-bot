import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type CourseRequestInsert = Database['public']['Tables']['course_request']['Insert']
type CourseRequestRow = Database['public']['Tables']['course_request']['Row']
type CourseRequestUpdate = Database['public']['Tables']['course_request']['Update']

export class CourseRequestService {
  constructor(private supabase: SupabaseClient) {}

  async create(courseRequestData: CourseRequestInsert): Promise<CourseRequestRow> {
    const { data, error } = await this.supabase
      .from('course_request')
      .insert(courseRequestData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create course request')
    }

    return data as CourseRequestRow
  }

  async findById(id: number): Promise<CourseRequestRow | null> {
    const { data, error } = await this.supabase
      .from('course_request')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as CourseRequestRow | null
  }

  async findByUserId(userId: number): Promise<CourseRequestRow[]> {
    const { data, error } = await this.supabase
      .from('course_request')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data as CourseRequestRow[]
  }

  async update(id: number, updates: CourseRequestUpdate): Promise<CourseRequestRow> {
    const { data, error } = await this.supabase
      .from('course_request')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to update course request')
    }

    return data as CourseRequestRow
  }
}
