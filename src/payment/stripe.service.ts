import type { Config } from '#root/config.js'
import Stripe from 'stripe'

export class StripeService {
  private stripe: Stripe
  private config: Config

  constructor(config: Config) {
    this.config = config
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    })
  }

  async createCustomer(options: {
    telegramId: number
    username?: string | null
    firstName?: string | null
    lastName?: string | null
  }): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      name: options.firstName && options.lastName
        ? `${options.firstName} ${options.lastName}`
        : options.firstName || options.username || `User ${options.telegramId}`,
      metadata: {
        telegram_id: options.telegramId.toString(),
        username: options.username || '',
      },
    })

    return customer
  }

  async createPaymentLink(options: {
    uploadId: number
    fileName: string
    amount: number
    currency: string
    botUsername?: string
  }): Promise<string> {
    const botUsername = options.botUsername || 'your_bot'
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: options.currency,
            product_data: {
              name: `Essay Analysis - ${options.fileName}`,
              description: 'AI detection and originality analysis',
            },
            unit_amount: options.amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        uploadId: options.uploadId.toString(),
      },
      success_url: `https://t.me/${botUsername}?start=payment_success_${options.uploadId}`,
      cancel_url: `https://t.me/${botUsername}?start=payment_cancel_${options.uploadId}`,
    })

    return session.url || ''
  }

  async createCreditPurchaseLink(options: {
    customerId: string
    credits: number
    amount: number
    currency: string
    botUsername?: string
  }): Promise<{ url: string, sessionId: string }> {
    const botUsername = options.botUsername || 'your_bot'
    const session = await this.stripe.checkout.sessions.create({
      customer: options.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: options.currency,
            product_data: {
              name: `${options.credits} Credits`,
              description: `Purchase ${options.credits} credits for essay analysis (1 credit = 20 HKD)`,
            },
            unit_amount: options.amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        type: 'credit_purchase',
        credits: options.credits.toString(),
      },
      success_url: `https://t.me/${botUsername}?start=credit_purchase_success`,
      cancel_url: `https://t.me/${botUsername}?start=credit_purchase_cancel`,
    })

    return {
      url: session.url || '',
      sessionId: session.id,
    }
  }

  async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId)
  }
}
