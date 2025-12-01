import type { Config } from '#root/config.js'

export interface OriginalityScanRequest {
  title: string
  check_ai: boolean
  check_plagiarism: boolean
  check_facts: boolean
  check_readability: boolean
  check_grammar: boolean
  check_contentOptimizer: boolean
  optimizerQuery?: string
  optimizerCountry?: string
  optimizerDevice?: string
  optimizerPublishingDomain?: string
  storeScan: boolean
  excludedUrls?: string[]
  aiModelVersion: string
  content: string
}

export interface OriginalityScanResponse {
  results: {
    properties: {
      privateID: number
      id: string
      title: string
      excludedUrls?: string[]
      publicLink: string
      content: string
      formattedContent: string
    }
    credits: {
      used: number
    }
    ai: {
      aiModel: string
      classification: {
        AI: number
        Original: number
      }
      confidence: {
        AI: number
        Original: number
      }
      blocks: Array<{
        text: string
        result: {
          fake: number
          real: number
          status: string
        }
      }>
    }
    plagiarism?: {
      error?: string
    }
    facts?: {
      error?: string
    }
    readability?: {
      error?: string
    }
    grammarSpelling?: {
      error?: string
    }
    contentOptimizer?: {
      error?: string
    }
  }
}

export class OriginalityService {
  private apiKey: string
  private apiUrl = 'https://api.originality.ai/api/v3/scan'

  constructor(config: Config) {
    if (!config.originalityApiKey) {
      throw new Error('Originality API key is not configured')
    }
    this.apiKey = config.originalityApiKey
  }

  async scanContent(request: OriginalityScanRequest): Promise<OriginalityScanResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OAI-API-KEY': this.apiKey,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Originality API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json() as OriginalityScanResponse
    return data
  }
}
