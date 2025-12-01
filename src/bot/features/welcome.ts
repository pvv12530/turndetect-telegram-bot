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
        // Preserve existing language_code if user has manually set it, otherwise use Telegram's language_code
        language_code: existingUser?.language_code || ctx.from.language_code || null,
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

  // Query services from database
  let services: Array<{ id: string, name: string | null, status: boolean | null, service_button_id: string | null }> = []
  try {
    const servicesList = await ctx.serviceService.findAll()
    services = servicesList.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      service_button_id: s.service_button_id,
    }))
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to fetch services')
  }

  // Build keyboard with services
  const keyboard = new InlineKeyboard()

  // Add service buttons
  if (services.length > 0) {
    for (const service of services) {
      if (service.service_button_id && service.name) {
        const statusEmoji = service.status ? '✅' : '❌'
        keyboard.text(`${statusEmoji} ${service.name}`, service.service_button_id)
      }
    }
    keyboard.row()
  }

  // Add other buttons
  keyboard
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

// Handle service button callbacks
feature.callbackQuery(/^service-button-/, logHandle('callback-service'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const buttonId = ctx.callbackQuery.data

  try {
    // Find service by button ID
    const service = await ctx.serviceService.findByButtonId(buttonId)

    if (!service) {
      await ctx.reply(ctx.t('welcome-service-not-found'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Check service status
    if (!service.status) {
      // Service is stopped
      await ctx.reply(ctx.t('welcome-service-stopped'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Service is active - store selected service and prompt for document upload
    ctx.session.selectedServiceButtonId = buttonId

    // Special handling for originality service
    if (buttonId === 'service-button-originality') {
      await ctx.reply(ctx.t('ai-report-introduction'), {
        parse_mode: 'HTML',
      })
    }
    else {
      await ctx.reply(ctx.t('welcome-upload-prompt-docx'), {
        parse_mode: 'HTML',
      })
    }
  }
  catch (error) {
    ctx.logger.error({ error, buttonId }, 'Failed to handle service button')
    await ctx.reply(ctx.t('welcome-error-occurred'), {
      parse_mode: 'HTML',
    })
  }
})

export { composer as welcomeFeature }
