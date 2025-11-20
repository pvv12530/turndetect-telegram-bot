import type { Context } from '#root/bot/context.js'
import { changeLanguageData } from '#root/bot/callback-data/change-language.js'
import { chunk } from '#root/bot/helpers/keyboard.js'
import { i18n } from '#root/bot/i18n.js'
import { InlineKeyboard } from 'grammy'
import ISO6391 from 'iso-639-1'

export async function createChangeLanguageKeyboard(ctx: Context) {
  // Always check database first as source of truth
  // This ensures we show the correct selected language even if session is reset
  let currentLocaleCode = 'en' // Default fallback

  if (ctx.session.userId) {
    try {
      const user = await ctx.userService.findById(ctx.session.userId)
      if (user?.language_code) {
        // Use database value as source of truth
        currentLocaleCode = user.language_code
        // Ensure locale is set in session to keep them in sync
        const sessionLocale = await ctx.i18n.getLocale()
        if (sessionLocale !== user.language_code) {
          await ctx.i18n.setLocale(user.language_code)
          ctx.logger.debug(
            { userId: user.id, dbLocale: user.language_code, sessionLocale },
            'Syncing locale from database to session',
          )
        }
      }
      else {
        // If no language in DB, check session
        currentLocaleCode = await ctx.i18n.getLocale()
      }
    }
    catch (error) {
      ctx.logger.error({ error }, 'Failed to get user language from database')
      // Fallback to session if DB check fails
      currentLocaleCode = await ctx.i18n.getLocale()
    }
  }
  else {
    // No userId, just use session
    currentLocaleCode = await ctx.i18n.getLocale()
  }

  const getLabel = (code: string) => {
    const isActive = code === currentLocaleCode
    // Handle language codes that ISO6391 might not recognize
    let nativeName: string
    if (code === 'zh-hans') {
      nativeName = '简体中文'
    }
    else {
      nativeName = ISO6391.getNativeName(code) || code
    }

    return `${isActive ? '✅ ' : ''}${nativeName}`
  }

  return InlineKeyboard.from(
    chunk(
      i18n.locales.map(localeCode => ({
        text: getLabel(localeCode),
        callback_data: changeLanguageData.pack({
          code: localeCode,
        }),
      })),
      2,
    ),
  )
}
