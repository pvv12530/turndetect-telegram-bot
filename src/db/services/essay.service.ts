import type { SupabaseClient } from '../supabase.js'
import type { Database } from '../types.js'

type EssayUploadInsert = Database['public']['Tables']['essay_uploads']['Insert']
type EssayUploadRow = Database['public']['Tables']['essay_uploads']['Row']

export class EssayService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get an account_tunnel_id with the lowest account count (essay_uploads count)
   * Only selects from active tunnels (status = true)
   * @returns The account_tunnel_id with the lowest count, or null if no active tunnels exist
   */
  async getAccountTunnelIdWithLowCount(): Promise<string | null> {
    // Fetch only active account_tunnels
    const { data: tunnels, error: tunnelsError } = await this.supabase
      .from('account_tunnels')
      .select('id')
      .eq('status', 'active')

    if (tunnelsError || !tunnels || tunnels.length === 0) {
      return null
    }

    // Get counts for all tunnels in parallel
    const tunnelCounts = await Promise.all(
      tunnels.map(async (tunnel) => {
        const { count, error } = await this.supabase
          .from('essay_uploads')
          .select('*', { count: 'exact', head: true })
          .eq('account_tunnel_id', tunnel.id)

        if (error) {
          return { id: tunnel.id, count: Infinity }
        }

        return { id: tunnel.id, count: count || 0 }
      }),
    )

    // Find the tunnel with the lowest count
    if (tunnelCounts.length === 0) {
      return null
    }

    const tunnelWithLowestCount = tunnelCounts.reduce((min, current) => {
      return current.count < min.count ? current : min
    }, tunnelCounts[0])

    return tunnelWithLowestCount.id
  }

  async createUpload(uploadData: EssayUploadInsert): Promise<EssayUploadRow> {
    // If account_tunnel_id is not provided, automatically select one with low count
    if (!uploadData.account_tunnel_id) {
      const accountTunnelId = await this.getAccountTunnelIdWithLowCount()
      if (accountTunnelId) {
        uploadData.account_tunnel_id = accountTunnelId
      }
    }

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
