import type { Context, SessionData } from '#root/bot/context.js'
import type { Config } from '#root/config.js'
import type { Logger } from '#root/logger.js'
import type { BotConfig } from 'grammy'
import { adminFeature } from '#root/bot/features/admin.js'
import { creditFeature } from '#root/bot/features/credit.js'
import { feedbackFeature } from '#root/bot/features/feedback.js'
import { languageFeature } from '#root/bot/features/language.js'
import { profileFeature } from '#root/bot/features/profile.js'
import { unhandledFeature } from '#root/bot/features/unhandled.js'
import { uploadFeature } from '#root/bot/features/upload.js'
import { welcomeFeature } from '#root/bot/features/welcome.js'
import { errorHandler } from '#root/bot/handlers/error.js'
import { i18n, isMultipleLocales } from '#root/bot/i18n.js'
import { session } from '#root/bot/middlewares/session.js'
import { updateLogger } from '#root/bot/middlewares/update-logger.js'
import { userSession } from '#root/bot/middlewares/user-session.js'
import { EssayService } from '#root/db/services/essay.service.js'
import { FeedbackService } from '#root/db/services/feedback.service.js'
import { UserService } from '#root/db/services/user.service.js'
import { createSupabaseClient } from '#root/db/supabase.js'
import { StripeService } from '#root/payment/stripe.service.js'
import { autoChatAction } from '@grammyjs/auto-chat-action'
import { hydrate } from '@grammyjs/hydrate'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import { sequentialize } from '@grammyjs/runner'
import { MemorySessionStorage, Bot as TelegramBot } from 'grammy'

interface Dependencies {
  config: Config
  logger: Logger
}

function getSessionKey(ctx: Omit<Context, 'session'>) {
  return ctx.chat?.id.toString()
}

export function createBot(token: string, dependencies: Dependencies, botConfig?: BotConfig<Context>) {
  const {
    config,
    logger,
  } = dependencies

  const bot = new TelegramBot<Context>(token, botConfig)

  // Initialize Supabase client and services
  const supabase = createSupabaseClient(config)
  const userService = new UserService(supabase)
  const essayService = new EssayService(supabase)
  const feedbackService = new FeedbackService(supabase)
  const stripeService = new StripeService(config)

  bot.use(async (ctx, next) => {
    ctx.config = config
    ctx.logger = logger.child({
      update_id: ctx.update.update_id,
    })
    ctx.userService = userService
    ctx.essayService = essayService
    ctx.feedbackService = feedbackService
    ctx.stripeService = stripeService

    await next()
  })

  const protectedBot = bot.errorBoundary(errorHandler)

  // Middlewares
  bot.api.config.use(parseMode('HTML'))

  if (config.isPollingMode)
    protectedBot.use(sequentialize(getSessionKey))
  if (config.isDebug)
    protectedBot.use(updateLogger())
  protectedBot.use(autoChatAction(bot.api))
  protectedBot.use(hydrateReply)
  protectedBot.use(hydrate())
  protectedBot.use(session({
    getSessionKey,
    storage: new MemorySessionStorage<SessionData>(),
  }))
  protectedBot.use(userSession())
  protectedBot.use(i18n)

  // Handlers
  protectedBot.use(welcomeFeature)
  protectedBot.use(profileFeature)
  protectedBot.use(creditFeature)
  protectedBot.use(feedbackFeature)
  protectedBot.use(uploadFeature)
  protectedBot.use(adminFeature)
  if (isMultipleLocales)
    protectedBot.use(languageFeature)

  // must be the last handler
  protectedBot.use(unhandledFeature)

  return bot
}

export type Bot = ReturnType<typeof createBot>
