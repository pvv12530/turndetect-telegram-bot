import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer, InlineKeyboard } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Handle profile button
feature.callbackQuery('profile', logHandle('callback-profile'), async (ctx) => {
  await ctx.answerCallbackQuery()

  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    await ctx.editMessageText(ctx.t('profile-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user) {
      ctx.logger.error({ userId: ctx.session.userId }, 'User not found in database')
      await ctx.editMessageText(ctx.t('profile-error'), {
        parse_mode: 'HTML',
      })
      return
    }

    const credit = Number(user.credit) || 0

    const keyboard = new InlineKeyboard()
      .text(ctx.t('profile-button-buy-credit'), 'buy_credit')
      .row()
      .text(ctx.t('profile-button-back-home'), 'home')

    await ctx.editMessageText(
      ctx.t('profile-message', {
        credit: credit.toString(),
      }),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
    )
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to load profile')
    await ctx.editMessageText(ctx.t('profile-error'), {
      parse_mode: 'HTML',
    })
  }
})

export { composer as profileFeature }
