import type { Config } from '#root/config.js'
import type { EssayService } from '#root/db/services/essay.service.js'
import type { FeedbackService } from '#root/db/services/feedback.service.js'
import type { OriginalityLogService } from '#root/db/services/originality-log.service.js'
import type { ServiceService } from '#root/db/services/service.service.js'
import type { UserService } from '#root/db/services/user.service.js'
import type { Logger } from '#root/logger.js'
import type { StripeService } from '#root/payment/stripe.service.js'
import type { OriginalityService } from '#root/services/originality.service.js'
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action'
import type { HydrateFlavor } from '@grammyjs/hydrate'
import type { I18nFlavor } from '@grammyjs/i18n'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import type { Context as DefaultContext, SessionFlavor } from 'grammy'

export interface SessionData {
  userId?: number
  waitingForCreditAmount?: boolean
  waitingForFeedbackMessage?: boolean
  feedbackRating?: 'good' | 'bad'
  selectedServiceButtonId?: string
  originalityUploadId?: number
  originalityWordCount?: number
  originalityCreditsRequired?: number
}

interface ExtendedContextFlavor {
  logger: Logger
  config: Config
  userService: UserService
  essayService: EssayService
  feedbackService: FeedbackService
  serviceService: ServiceService
  stripeService: StripeService
  originalityService?: OriginalityService
  originalityLogService: OriginalityLogService
}

export type Context = ParseModeFlavor<
  HydrateFlavor<
    DefaultContext &
    ExtendedContextFlavor &
    SessionFlavor<SessionData> &
    I18nFlavor &
    AutoChatActionFlavor
  >
>
