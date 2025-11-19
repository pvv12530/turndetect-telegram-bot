import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer, InlineKeyboard } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Calculate price in HKD based on credit amount (bulk pricing)
function calculateCreditPrice(credits: number): number {
  if (credits === 10) {
    return 180 // 10 credits = HKD 180
  }
  if (credits === 100) {
    return 1700 // 100 credits = HKD 1700
  }
  // For custom amounts, use tiered pricing
  if (credits >= 100) {
    return credits * 17 // 17 HKD per credit for 100+ credits
  }
  if (credits >= 10) {
    return credits * 18 // 18 HKD per credit for 10-99 credits
  }
  return credits * 18 // 18 HKD per credit for < 10 credits
}

// Handle buy credit button
feature.callbackQuery('buy_credit', logHandle('callback-buy-credit'), async (ctx) => {
  await ctx.answerCallbackQuery()

  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    await ctx.reply(ctx.t('credit-purchase-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user || !user.customer_id) {
      await ctx.reply(ctx.t('profile-error-customer'), {
        parse_mode: 'HTML',
      })
      return
    }

    const credit = Number(user.credit) || 0

    const keyboard = new InlineKeyboard()
      .text(ctx.t('credit-button-buy-10'), 'buy_credit_10')
      .text(ctx.t('credit-button-buy-100'), 'buy_credit_100')
      .row()
      .text(ctx.t('credit-button-buy-custom'), 'buy_credit_custom')
      .row()
      .text(ctx.t('credit-button-back-profile'), 'profile')

    // Calculate price for display
    const price10 = calculateCreditPrice(10)

    await ctx.editMessageText(
      ctx.t('credit-purchase-message', {
        currentCredit: credit.toString(),
        pricePerCredit: (price10 / 10).toString(), // Show price per credit for 10-credit package
      }),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
    )
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to load credit purchase')
    await ctx.reply(ctx.t('credit-purchase-error'), {
      parse_mode: 'HTML',
    })
  }
})

// Handle buy 10 credits
feature.callbackQuery('buy_credit_10', logHandle('callback-buy-credit-10'), async (ctx) => {
  await ctx.answerCallbackQuery()
  await handleCreditPurchase(ctx, 10)
})

// Handle buy 100 credits
feature.callbackQuery('buy_credit_100', logHandle('callback-buy-credit-100'), async (ctx) => {
  await ctx.answerCallbackQuery()
  await handleCreditPurchase(ctx, 100)
})

// Handle buy custom credits
feature.callbackQuery('buy_credit_custom', logHandle('callback-buy-credit-custom'), async (ctx) => {
  await ctx.answerCallbackQuery()
  await ctx.reply(ctx.t('credit-purchase-custom-prompt'), {
    parse_mode: 'HTML',
  })
  ctx.session.waitingForCreditAmount = true
})

// Handle custom credit amount input
feature.on('message:text', async (ctx, next) => {
  if (ctx.session.waitingForCreditAmount && ctx.session.userId) {
    const text = ctx.message.text.trim()
    const amount = Number.parseInt(text, 10)

    if (Number.isNaN(amount) || amount <= 0) {
      await ctx.reply(ctx.t('credit-purchase-invalid-amount'), {
        parse_mode: 'HTML',
      })
      return
    }

    ctx.session.waitingForCreditAmount = false
    await handleCreditPurchase(ctx, amount)
    return
  }

  await next()
})

async function handleCreditPurchase(ctx: Context, credits: number) {
  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    const sendMethod = ctx.callbackQuery ? ctx.editMessageText.bind(ctx) : ctx.reply.bind(ctx)
    await sendMethod(ctx.t('credit-purchase-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user || !user.customer_id) {
      const sendMethod = ctx.callbackQuery ? ctx.editMessageText.bind(ctx) : ctx.reply.bind(ctx)
      await sendMethod(ctx.t('profile-error-customer'), {
        parse_mode: 'HTML',
      })
      return
    }

    const amountHKD = calculateCreditPrice(credits)
    const amountCents = amountHKD * 100 // Convert to cents

    // Create transaction record
    const { TransactionService } = await import('#root/db/services/transaction.service.js')
    const { createSupabaseClient } = await import('#root/db/supabase.js')
    const supabase = createSupabaseClient(ctx.config)
    const transactionService = new TransactionService(supabase)

    const transaction = await transactionService.create({
      user_id: user.id,
      amount: amountCents,
      currency: 'hkd',
      credits,
      status: 'pending',
    })

    // Create Stripe checkout session
    const { url: paymentUrl, sessionId } = await ctx.stripeService.createCreditPurchaseLink({
      customerId: user.customer_id,
      credits,
      amount: amountCents,
      currency: 'hkd',
      botUsername: ctx.config.botUsername,
    })

    // Update transaction with session ID
    await transactionService.update(transaction.id, {
      stripe_session_id: sessionId,
    })

    const keyboard = new InlineKeyboard()
      .url(ctx.t('credit-button-pay-now'), paymentUrl)
      .row()
      .text(ctx.t('credit-button-back-profile'), 'profile')

    // Use editMessageText for callback queries, reply for text messages
    const sendMethod = ctx.callbackQuery ? ctx.editMessageText.bind(ctx) : ctx.reply.bind(ctx)
    await sendMethod(
      ctx.t('credit-purchase-checkout', {
        credits: credits.toString(),
        amount: amountHKD.toString(),
      }),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
    )

    ctx.logger.info({
      userId: user.id,
      credits,
      amount: amountCents,
      transactionId: transaction.id,
    }, 'Credit purchase checkout created')
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to create credit purchase')
    await ctx.reply(ctx.t('credit-purchase-error'), {
      parse_mode: 'HTML',
    })
  }
}

export { composer as creditFeature }
