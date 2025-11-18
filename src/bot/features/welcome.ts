import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer, InlineKeyboard } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), async (ctx) => {
  // Save or update user in database
  if (ctx.from) {
    try {
      const existingUser = await ctx.userService.findByTelegramId(ctx.from.id)
      const isNewUser = !existingUser

      const user = await ctx.userService.upsert({
        telegram_id: ctx.from.id,
        username: ctx.from.username || null,
        first_name: ctx.from.first_name || null,
        last_name: ctx.from.last_name || null,
        language_code: ctx.from.language_code || null,
        credit: existingUser?.credit || 0,
      })

      // Create Stripe customer for new users
      if (isNewUser && !user.customer_id) {
        try {
          const customer = await ctx.stripeService.createCustomer({
            telegramId: ctx.from.id,
            username: ctx.from.username || null,
            firstName: ctx.from.first_name || null,
            lastName: ctx.from.last_name || null,
          })
          await ctx.userService.updateCustomerId(user.id, customer.id)
          user.customer_id = customer.id
          ctx.logger.info({ userId: user.id, customerId: customer.id }, 'Stripe customer created')
        }
        catch (error) {
          ctx.logger.error({ error }, 'Failed to create Stripe customer')
        }
      }

      // Store user ID in session
      ctx.session.userId = user.id

      ctx.logger.info({ userId: user.id, telegramId: ctx.from.id }, 'User registered/updated')
    }
    catch (error) {
      ctx.logger.error({ error }, 'Failed to save user to database')
    }
  }

  // Handle payment callbacks
  const startParam = ctx.match
  if (startParam) {
    if (startParam === 'credit_purchase_success') {
      await ctx.reply(ctx.t('credit-purchase-success'), {
        parse_mode: 'HTML',
      })
    }
    else if (startParam === 'credit_purchase_cancel') {
      await ctx.reply(ctx.t('credit-purchase-cancelled'), {
        parse_mode: 'HTML',
      })
    }
  }

  const keyboard = new InlineKeyboard()
    .text(ctx.t('welcome-button-upload'), 'upload_essay')
    .row()
    .text(ctx.t('welcome-button-profile'), 'profile')
    .text(ctx.t('welcome-button-language'), 'change_language')
    .row()
    .text(ctx.t('welcome-button-feedback'), 'feedback')
    .row()
    .text(ctx.t('welcome-button-help'), 'help')

  return ctx.reply(ctx.t('welcome'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

export { composer as welcomeFeature }
