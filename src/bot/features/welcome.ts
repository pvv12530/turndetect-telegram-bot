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
    // Check for course request first (handled by separate handler below)
    if (startParam === 'credit_purchase_success' && !ctx.session.courseRequestId) {
      await ctx.reply(ctx.t('credit-purchase-success'), {
        parse_mode: 'HTML',
      })
      return
    }
    else if (startParam === 'credit_purchase_cancel') {
      await ctx.reply(ctx.t('credit-purchase-cancelled'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Handle credit purchase success - check if there's a pending course request
    if (startParam === 'credit_purchase_success' && ctx.session.courseRequestId) {
      // User just bought credits and has a pending course request
      // Show payment panel again
      try {
        const courseRequest = await ctx.courseRequestService.findById(ctx.session.courseRequestId)
        if (courseRequest && courseRequest.payment_status !== 'paid') {
          await ctx.reply(ctx.t('course-request-credits-added'), {
            parse_mode: 'HTML',
          })
          await showCourseRequestPaymentPanel(ctx, ctx.session.courseRequestId)
          return
        }
      }
      catch (error) {
        ctx.logger.error({ error }, 'Failed to check course request after credit purchase')
      }
    }

    // Handle course request payment callbacks (old Stripe payment method - no longer used but kept for compatibility)
    const courseRequestPaymentSuccessMatch = startParam.match(/course_request_payment_success_(\d+)/)
    const courseRequestPaymentCancelMatch = startParam.match(/course_request_payment_cancel_(\d+)/)

    if (courseRequestPaymentSuccessMatch) {
      const courseRequestId = Number(courseRequestPaymentSuccessMatch[1])

      try {
        const courseRequest = await ctx.courseRequestService.findById(courseRequestId)

        if (!courseRequest) {
          await ctx.reply(ctx.t('course-request-not-found'), {
            parse_mode: 'HTML',
          })
          return
        }

        if (courseRequest.payment_status === 'paid') {
          await ctx.reply(
            ctx.t('course-request-already-paid', { requestId: courseRequestId.toString() }),
            {
              parse_mode: 'HTML',
            },
          )
          return
        }

        // Update course request with payment status
        const creditsUsed = 5
        await ctx.courseRequestService.update(courseRequestId, {
          payment_status: 'paid',
          credit_used: creditsUsed,
        })

        // Reply to user with request ID
        const keyboard = new InlineKeyboard()
          .text(ctx.t('welcome-button-profile'), 'profile')

        await ctx.reply(
          ctx.t('course-request-payment-success', { requestId: courseRequestId.toString() }),
          {
            parse_mode: 'HTML',
            reply_markup: keyboard,
          },
        )

        ctx.logger.info({
          courseRequestId,
          userId: courseRequest.user_id,
        }, 'Course request payment completed')
      }
      catch (error) {
        ctx.logger.error({ error, courseRequestId }, 'Failed to process course request payment')
        await ctx.reply(ctx.t('course-request-payment-error'), {
          parse_mode: 'HTML',
        })
      }

      return
    }

    if (courseRequestPaymentCancelMatch) {
      const courseRequestId = Number(courseRequestPaymentCancelMatch[1])

      // Clear session if this was the current course request
      if (ctx.session.courseRequestId === courseRequestId) {
        ctx.session.courseRequestId = undefined
      }

      await ctx.reply(ctx.t('course-request-payment-cancelled'), {
        parse_mode: 'HTML',
      })
      return
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
    // Special handling for course service
    else if (buttonId === 'service-button-course') {
      await ctx.reply(ctx.t('course-service-introduction'), {
        parse_mode: 'HTML',
      })
      ctx.session.waitingForCourseRequest = true
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

// Handle course request text input
feature.on('message:text', async (ctx, next) => {
  if (ctx.session.waitingForCourseRequest && ctx.session.userId) {
    const userRequest = ctx.message.text.trim()

    if (userRequest.length === 0) {
      await ctx.reply(ctx.t('course-request-empty'), {
        parse_mode: 'HTML',
      })
      return
    }

    ctx.session.waitingForCourseRequest = false

    try {
      // Create course request in database
      const courseRequest = await ctx.courseRequestService.create({
        user_id: ctx.session.userId,
        status: 'queue',
        user_request: userRequest,
      })

      // Store course request ID in session
      ctx.session.courseRequestId = courseRequest.id

      // Reply to user that we'll respond within 8 hours
      await ctx.reply(ctx.t('course-request-confirmation'), {
        parse_mode: 'HTML',
      })

      // Get user for payment
      const user = await ctx.userService.findById(ctx.session.userId)
      if (!user || !user.customer_id) {
        await ctx.reply(ctx.t('profile-error-customer'), {
          parse_mode: 'HTML',
        })
        return
      }

      // Check credits and show payment panel
      await showCourseRequestPaymentPanel(ctx, courseRequest.id)

      ctx.logger.info({
        courseRequestId: courseRequest.id,
        userId: ctx.session.userId,
      }, 'Course request created')
    }
    catch (error) {
      ctx.logger.error({ error }, 'Failed to create course request')
      await ctx.reply(ctx.t('course-request-error'), {
        parse_mode: 'HTML',
      })
    }

    return
  }

  await next()
})

// Helper function to show course request payment panel
async function showCourseRequestPaymentPanel(ctx: Context, courseRequestId: number) {
  if (!ctx.session.userId) {
    return
  }

  const creditsRequired = 5
  const user = await ctx.userService.findById(ctx.session.userId)
  if (!user || !user.customer_id) {
    await ctx.reply(ctx.t('profile-error-customer'), {
      parse_mode: 'HTML',
    })
    return
  }

  const currentCredits = Number(user.credit) || 0
  const hasEnoughCredits = currentCredits >= creditsRequired

  const keyboard = new InlineKeyboard()

  if (hasEnoughCredits) {
    // Show "Pay with Credits" button (not link)
    keyboard.text(ctx.t('course-request-pay-with-credits-button'), `course_request_pay_${courseRequestId}`)
  }
  else {
    // Show "Buy Credits" link button
    // Create a special buy credit link that returns to course request
    const { url: buyCreditUrl } = await ctx.stripeService.createCreditPurchaseLink({
      customerId: user.customer_id,
      credits: 5, // Default to 10 credits
      amount: 900, // 10 credits * 20 HKD * 100 cents
      currency: 'hkd',
      botUsername: ctx.config.botUsername,
    })
    keyboard.url(ctx.t('course-request-buy-credits-button'), buyCreditUrl)
  }

  keyboard.row().text(ctx.t('welcome-button-profile'), 'profile')

  await ctx.reply(
    ctx.t('course-request-payment-prompt', {
      creditsRequired: creditsRequired.toString(),
      currentCredits: currentCredits.toString(),
    }),
    {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    },
  )
}

// Handle "Pay with Credits" button for course request
feature.callbackQuery(/^course_request_pay_(\d+)$/, logHandle('callback-course-request-pay'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const courseRequestId = Number(ctx.match[1])

  if (!ctx.session.userId) {
    await ctx.reply(ctx.t('course-request-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    const courseRequest = await ctx.courseRequestService.findById(courseRequestId)

    if (!courseRequest) {
      await ctx.reply(ctx.t('course-request-not-found'), {
        parse_mode: 'HTML',
      })
      return
    }

    if (courseRequest.payment_status === 'paid') {
      await ctx.reply(
        ctx.t('course-request-already-paid', { requestId: courseRequestId.toString() }),
        {
          parse_mode: 'HTML',
        },
      )
      return
    }

    // Check user credits
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user) {
      await ctx.reply(ctx.t('course-request-error'), {
        parse_mode: 'HTML',
      })
      return
    }

    const creditsRequired = 5
    const currentCredits = Number(user.credit) || 0

    if (currentCredits < creditsRequired) {
      await ctx.reply(ctx.t('course-request-insufficient-credits'), {
        parse_mode: 'HTML',
      })
      // Show payment panel again
      await showCourseRequestPaymentPanel(ctx, courseRequestId)
      return
    }

    // Deduct credits
    await ctx.userService.deductCredit(ctx.session.userId, creditsRequired)

    // Update course request with payment status
    await ctx.courseRequestService.update(courseRequestId, {
      payment_status: 'paid',
      credit_used: creditsRequired,
    })

    // Reply to user with request ID
    const keyboard = new InlineKeyboard()
      .text(ctx.t('welcome-button-profile'), 'profile')

    await ctx.editMessageText(
      ctx.t('course-request-payment-success', { requestId: courseRequestId.toString() }),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
    )

    // Clear course request ID from session
    ctx.session.courseRequestId = undefined

    ctx.logger.info({
      courseRequestId,
      userId: ctx.session.userId,
    }, 'Course request paid with credits')
  }
  catch (error) {
    ctx.logger.error({ error, courseRequestId }, 'Failed to process course request payment')
    await ctx.reply(ctx.t('course-request-payment-error'), {
      parse_mode: 'HTML',
    })
  }
})

export { composer as welcomeFeature }
