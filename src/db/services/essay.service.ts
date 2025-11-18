import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type EssayUploadInsert = Database['public']['Tables']['essay_uploads']['Insert']
type EssayUploadRow = Database['public']['Tables']['essay_uploads']['Row']

export class EssayService {
  constructor(private supabase: SupabaseClient) {}

  async createUpload(uploadData: EssayUploadInsert): Promise<EssayUploadRow> {
    const { data, error } = await this.supabase
      .from('essay_uploads')
      .insert(uploadData)
      .select()
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create upload')
    }

    return data as EssayUploadRow
  }

  async updateStatus(id: number, status: EssayUploadRow['status']): Promise<void> {
    const { error } = await this.supabase
      .from('essay_uploads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  async getUploadById(id: number): Promise<EssayUploadRow | null> {
    const { data, error } = await this.supabase
      .from('essay_uploads')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as EssayUploadRow | null
  }

  async updatePaymentSession(id: number, sessionId: string, status: EssayUploadRow['status']): Promise<void> {
    const { error } = await this.supabase
      .from('essay_uploads')
      .update({
        payment_session_id: sessionId,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  async uploadFile(bucket: string, path: string, file: ArrayBuffer, contentType?: string): Promise<string> {
    const { data, error } = await this.supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      throw error
    }

    return data.path
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }
}
