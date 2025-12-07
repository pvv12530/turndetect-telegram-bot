import process from 'node:process'
import { API_CONSTANTS } from 'grammy'
import * as v from 'valibot'

const baseConfigSchema = v.object({
  debug: v.optional(v.pipe(v.string(), v.transform(JSON.parse), v.boolean()), 'false'),
  logLevel: v.optional(v.pipe(v.string(), v.picklist(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])), 'info'),
  botToken: v.pipe(v.string(), v.regex(/^\d+:[\w-]+$/, 'Invalid token')),
  botAllowedUpdates: v.optional(v.pipe(v.string(), v.transform(JSON.parse), v.array(v.picklist(API_CONSTANTS.ALL_UPDATE_TYPES))), '[]'),
  botAdmins: v.optional(v.pipe(v.string(), v.transform(JSON.parse), v.array(v.number())), '[]'),
  supabaseUrl: v.pipe(v.string(), v.url()),
  supabaseKey: v.string(),
  stripeSecretKey: v.string(),
  stripePrice: v.optional(v.pipe(v.string(), v.transform(Number), v.number())),
  stripeCurrency: v.optional(v.string(), 'usd'),
  botUsername: v.optional(v.string(), 'your_bot'),
  backendApiUrl: v.optional(v.pipe(v.string(), v.url())),
  apiBaseUrl: v.optional(v.pipe(v.string(), v.url()), 'https://turnitin-admin.vercel.app'),
  originalityApiKey: v.optional(v.string()),
})

const configSchema = v.variant('botMode', [
  // polling config
  v.pipe(
    v.object({
      botMode: v.literal('polling'),
      ...baseConfigSchema.entries,
    }),
    v.transform(input => ({
      ...input,
      isDebug: input.debug,
      isWebhookMode: false as const,
      isPollingMode: true as const,
    })),
  ),
  // webhook config
  v.pipe(
    v.object({
      botMode: v.literal('webhook'),
      ...baseConfigSchema.entries,
      botWebhook: v.pipe(v.string(), v.url()),
      botWebhookSecret: v.pipe(v.string(), v.minLength(12)),
      serverHost: v.optional(v.string(), '0.0.0.0'),
      serverPort: v.optional(v.pipe(v.string(), v.transform(Number), v.number()), '80'),
    }),
    v.transform(input => ({
      ...input,
      isDebug: input.debug,
      isWebhookMode: true as const,
      isPollingMode: false as const,
    })),
  ),
])

export type Config = v.InferOutput<typeof configSchema>
export type PollingConfig = v.InferOutput<typeof configSchema['options'][0]>
export type WebhookConfig = v.InferOutput<typeof configSchema['options'][1]>

export function createConfig(input: v.InferInput<typeof configSchema>) {
  return v.parse(configSchema, input)
}

export const config = createConfigFromEnvironment()

function createConfigFromEnvironment() {
  type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>

  type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends object ? KeysToCamelCase<T[K]> : T[K]
  }

  function toCamelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_match, p1) => p1.toUpperCase())
  }

  function convertKeysToCamelCase<T>(obj: T): KeysToCamelCase<T> {
    const result: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelCaseKey = toCamelCase(key)
        result[camelCaseKey] = obj[key]
      }
    }
    return result
  }

  try {
    process.loadEnvFile()
  }
  catch {
    // No .env file found
  }

  try {
    // @ts-expect-error create config from environment variables
    const config = createConfig(convertKeysToCamelCase(process.env))

    return config
  }
  catch (error) {
    if (error instanceof v.ValiError) {
      const missingFields = error.issues
        .filter(issue => issue.type === 'string' && issue.input === undefined)
        .map((issue) => {
          const path = issue.path?.map((p: { key?: string }) => p.key).filter(Boolean).join('.') || 'unknown'
          return path
        })
        .filter((value, index, self) => self.indexOf(value) === index) // unique values

      if (missingFields.length > 0) {
        throw new Error(
          `Invalid config: Missing required environment variables: ${missingFields.map(f => f.toUpperCase().replace(/\./g, '_')).join(', ')}`,
          { cause: error },
        )
      }
    }
    throw new Error('Invalid config', {
      cause: error,
    })
  }
}
