import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer, InlineKeyboard } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Handle feedback button
feature.callbackQuery('feedback', logHandle('callback-feedback'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const keyboard = new InlineKeyboard()
    .text(ctx.t('feedback-button-good'), 'feedback_good')
    .text(ctx.t('feedback-button-bad'), 'feedback_bad')
    .row()
    .text(ctx.t('feedback-button-exit'), 'feedback_exit')

  await ctx.editMessageText(ctx.t('feedback-prompt'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

// Handle good feedback
feature.callbackQuery('feedback_good', logHandle('callback-feedback-good'), async (ctx) => {
  await ctx.answerCallbackQuery()

  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    await ctx.editMessageText(ctx.t('feedback-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  // Save feedback rating and wait for message
  ctx.session.feedbackRating = 'good'
  ctx.session.waitingForFeedbackMessage = true

  const keyboard = new InlineKeyboard()
    .text(ctx.t('feedback-button-skip'), 'feedback_skip')
    .row()
    .text(ctx.t('feedback-button-exit'), 'feedback_exit')

  await ctx.editMessageText(ctx.t('feedback-message-prompt'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

// Handle bad feedback
feature.callbackQuery('feedback_bad', logHandle('callback-feedback-bad'), async (ctx) => {
  await ctx.answerCallbackQuery()

  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    await ctx.editMessageText(ctx.t('feedback-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  // Save feedback rating and wait for message
  ctx.session.feedbackRating = 'bad'
  ctx.session.waitingForFeedbackMessage = true

  const keyboard = new InlineKeyboard()
    .text(ctx.t('feedback-button-skip'), 'feedback_skip')
    .row()
    .text(ctx.t('feedback-button-exit'), 'feedback_exit')

  await ctx.editMessageText(ctx.t('feedback-message-prompt'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

// Handle skip message
feature.callbackQuery('feedback_skip', logHandle('callback-feedback-skip'), async (ctx) => {
  await ctx.answerCallbackQuery()
  await saveFeedback(ctx, null)
})

// Handle exit
feature.callbackQuery('feedback_exit', logHandle('callback-feedback-exit'), async (ctx) => {
  await ctx.answerCallbackQuery()

  ctx.session.waitingForFeedbackMessage = false
  ctx.session.feedbackRating = undefined

  const keyboard = new InlineKeyboard()
    .text(ctx.t('welcome-button-upload'), 'upload_essay')
    .row()
    .text(ctx.t('welcome-button-profile'), 'profile')
    .text(ctx.t('welcome-button-language'), 'change_language')
    .row()
    .text(ctx.t('welcome-button-feedback'), 'feedback')
    .row()
    .text(ctx.t('welcome-button-help'), 'help')

  await ctx.editMessageText(ctx.t('welcome'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

// Handle feedback message input
feature.on('message:text', async (ctx, next) => {
  if (ctx.session.waitingForFeedbackMessage && ctx.session.feedbackRating && ctx.session.userId) {
    const message = ctx.message.text.trim()

    if (message.length > 0) {
      ctx.session.waitingForFeedbackMessage = false
      const rating = ctx.session.feedbackRating
      ctx.session.feedbackRating = undefined

      await saveFeedback(ctx, message, rating)
      return
    }
  }

  await next()
})

async function saveFeedback(ctx: Context, message: string | null, rating?: 'good' | 'bad') {
  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    await ctx.reply(ctx.t('feedback-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  const feedbackRating = rating || ctx.session.feedbackRating

  if (!feedbackRating) {
    ctx.logger.error({ userId: ctx.session.userId }, 'Feedback rating not set')
    await ctx.reply(ctx.t('feedback-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    await ctx.feedbackService.create({
      user_id: ctx.session.userId,
      rating: feedbackRating,
      message: message || null,
    })

    ctx.logger.info({ userId: ctx.session.userId, rating: feedbackRating }, 'Feedback saved')

    const keyboard = new InlineKeyboard()
      .text(ctx.t('welcome-button-upload'), 'upload_essay')
      .row()
      .text(ctx.t('welcome-button-profile'), 'profile')
      .text(ctx.t('welcome-button-language'), 'change_language')
      .row()
      .text(ctx.t('welcome-button-feedback'), 'feedback')
      .row()
      .text(ctx.t('welcome-button-help'), 'help')

    // Use editMessageText for callback queries, reply for text messages
    const sendMethod = ctx.callbackQuery ? ctx.editMessageText.bind(ctx) : ctx.reply.bind(ctx)
    await sendMethod(ctx.t('feedback-thank-you'), {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })

    ctx.session.waitingForFeedbackMessage = false
    ctx.session.feedbackRating = undefined
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to save feedback')
    await ctx.reply(ctx.t('feedback-error'), {
      parse_mode: 'HTML',
    })
  }
}

export { composer as feedbackFeature }
