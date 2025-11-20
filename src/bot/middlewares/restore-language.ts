import type { Context } from '#root/bot/context.js'
import type { Middleware } from 'grammy'
import { i18n } from '#root/bot/i18n.js'

/**
 * Middleware to restore user language preference from database
 * Runs after i18n middleware to ensure ctx.i18n is available
 * Always restores user's saved preference to ensure all messages are in the correct language
 */
export function restoreLanguage(): Middleware<Context> {
  return async (ctx, next) => {
    // Only process private chats
    if (ctx.chat?.type === 'private' && ctx.session.userId) {
      try {
        const user = await ctx.userService.findById(ctx.session.userId)
        if (user?.language_code && i18n.locales.includes(user.language_code)) {
          // Always restore user's saved language preference from database
          // This ensures all messages are sent in the user's preferred language
          const currentLocale = await ctx.i18n.getLocale()
          if (currentLocale !== user.language_code) {
            await ctx.i18n.setLocale(user.language_code)
            ctx.logger.debug(
              { userId: user.id, languageCode: user.language_code, previousLocale: currentLocale },
              'Language preference restored from database',
            )
          }
        }
      }
      catch (error) {
        ctx.logger.error({ error, userId: ctx.session.userId }, 'Failed to restore language preference')
      }
    }

    await next()
  }
}
