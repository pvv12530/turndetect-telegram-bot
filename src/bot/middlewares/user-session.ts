import type { Context } from '#root/bot/context.js'
import type { Middleware } from 'grammy'

/**
 * Middleware to automatically populate user session from database
 * whenever a user sends a message. This ensures the session is always
 * populated even after server restarts.
 */
export function userSession(): Middleware<Context> {
  return async (ctx, next) => {
    // Only process private chats and if userId is not already set
    if (ctx.chat?.type === 'private' && ctx.from && !ctx.session.userId) {
      try {
        const user = await ctx.userService.findByTelegramId(ctx.from.id)
        if (user) {
          ctx.session.userId = user.id
          ctx.logger.debug({ userId: user.id, telegramId: ctx.from.id }, 'User session populated from database')
        }
      }
      catch (error) {
        ctx.logger.error({ error, telegramId: ctx.from.id }, 'Failed to populate user session')
      }
    }

    await next()
  }
}
