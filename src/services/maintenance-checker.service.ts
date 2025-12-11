import type { ServiceService } from '#root/db/services/service.service.js'
import type { Logger } from '#root/logger.js'
import axios from 'axios'

interface MaintenanceStatusResponse {
  is_maintenance: boolean
  last_maintenance?: {
    duration_minutes: number
    ended_at: string
    started_at: string
  }
  updated_at: string
}

export class MaintenanceCheckerService {
  private readonly apiUrl = 'https://production.turnitindetect.org/maintenance-status'

  constructor(
    private serviceService: ServiceService,
    private logger: Logger,
  ) {}

  async checkAndUpdateMaintenanceStatus(): Promise<void> {
    try {
      this.logger.debug('Checking maintenance status...')

      const response = await axios.get<MaintenanceStatusResponse>(this.apiUrl, {
        timeout: 10000, // 10 second timeout
      })

      const { is_maintenance } = response.data

      // Update the turnitin service in the database
      const result = await this.serviceService.updateByName('turnitin', {
        status: !is_maintenance, // status is true when NOT in maintenance
        note: is_maintenance ? 'service is in maintenance' : '',
      })

      if (result) {
        this.logger.info({
          msg: 'Maintenance status updated',
          is_maintenance,
          service_name: 'turnitin',
          service_status: result.status,
        })
      }
      else {
        this.logger.warn({
          msg: 'Service "turnitin" not found in database',
          is_maintenance,
        })
      }
    }
    catch (error) {
      this.logger.error({
        error,
        msg: 'Failed to check maintenance status',
      })
    }
  }
}
