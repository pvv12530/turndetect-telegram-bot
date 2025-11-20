import type { Context } from '#root/bot/context.js'
import { changeLanguageData } from '#root/bot/callback-data/change-language.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { i18n } from '#root/bot/i18n.js'
import { createChangeLanguageKeyboard } from '#root/bot/keyboards/change-language.js'
import { Composer } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('language', logHandle('command-language'), async (ctx) => {
  return ctx.reply(ctx.t('language-select'), {
    reply_markup: await createChangeLanguageKeyboard(ctx),
  })
})

feature.callbackQuery('change_language', logHandle('keyboard-change-language'), async (ctx) => {
  await ctx.answerCallbackQuery()
  return ctx.editMessageText(ctx.t('language-select'), {
    reply_markup: await createChangeLanguageKeyboard(ctx),
  })
})

feature.callbackQuery(
  changeLanguageData.filter(),
  logHandle('keyboard-language-select'),
  async (ctx) => {
    const { code: languageCode } = changeLanguageData.unpack(
      ctx.callbackQuery.data,
    )

    if (i18n.locales.includes(languageCode)) {
      await ctx.i18n.setLocale(languageCode)

      // Save language preference to database
      if (ctx.session.userId) {
        try {
          await ctx.userService.update(ctx.session.userId, {
            language_code: languageCode,
          })
          ctx.logger.info(
            { userId: ctx.session.userId, languageCode },
            'Language preference saved to database',
          )
        }
        catch (error) {
          ctx.logger.error(
            { error, userId: ctx.session.userId, languageCode },
            'Failed to save language preference to database',
          )
          // Continue even if database update fails - language is already set in session
        }
      }

      return ctx.editMessageText(ctx.t('language-changed'), {
        reply_markup: await createChangeLanguageKeyboard(ctx),
      })
    }
  },
)

export { composer as languageFeature }
