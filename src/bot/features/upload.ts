import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer, InlineKeyboard } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Handle callback query for upload button
feature.callbackQuery('upload_essay', logHandle('callback-upload'), async (ctx) => {
  await ctx.answerCallbackQuery()
  await ctx.reply(ctx.t('upload-prompt'), {
    parse_mode: 'HTML',
  })
})

// Handle document uploads
feature.on('message:document', logHandle('message-document'), async (ctx) => {
  const document = ctx.message.document

  if (!ctx.session.userId) {
    ctx.logger.error({ telegramId: ctx.from?.id }, 'User session not populated')
    await ctx.reply(ctx.t('upload-error'), {
      parse_mode: 'HTML',
    })
    return
  }

  // Skip if waiting for credit amount input
  if (ctx.session.waitingForCreditAmount) {
    return
  }

  try {
    // Check user credit
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user) {
      ctx.logger.error({ userId: ctx.session.userId }, 'User not found in database')
      await ctx.reply(ctx.t('upload-error'), {
        parse_mode: 'HTML',
      })
      return
    }

    const currentCredit = Number(user.credit) || 0
    const requiredCredit = 1

    if (currentCredit < requiredCredit) {
      const keyboard = new InlineKeyboard()
        .text(ctx.t('upload-insufficient-credit-button'), 'buy_credit')
        .row()
        .text(ctx.t('upload-insufficient-credit-button-home'), 'home')

      await ctx.reply(
        ctx.t('upload-insufficient-credit', {
          currentCredit: currentCredit.toString(),
          requiredCredit: requiredCredit.toString(),
        }),
        {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        },
      )
      return
    }

    // Show processing message
    const processingMsg = await ctx.reply(ctx.t('upload-processing'), {
      parse_mode: 'HTML',
    })

    // Get file from Telegram
    const file = await ctx.api.getFile(document.file_id)

    if (!file.file_path) {
      throw new Error('File path not available')
    }

    // Download file
    const fileUrl = `https://api.telegram.org/file/bot${ctx.config.botToken}/${file.file_path}`
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()

    // Generate unique file path
    const timestamp = Date.now()
    const fileName = document.file_name || `essay_${timestamp}`
    const filePath = `essays/${ctx.from.id}/${timestamp}_${fileName}`

    // Upload to Supabase storage
    await ctx.essayService.uploadFile(
      'essays',
      filePath,
      arrayBuffer,
      document.mime_type || 'application/octet-stream',
    )

    // Log upload to database
    const upload = await ctx.essayService.createUpload({
      user_id: ctx.session.userId,
      file_name: fileName,
      file_size: document.file_size || 0,
      file_path: filePath,
      mime_type: document.mime_type || null,
      payment_status: 'paid', // Credit-based payment
      status: 'queued',
    })

    // Deduct credit
    await ctx.userService.deductCredit(ctx.session.userId, requiredCredit)

    // Log credit usage
    const { CreditUsageService } = await import('#root/db/services/credit-usage.service.js')
    const { createSupabaseClient } = await import('#root/db/supabase.js')
    const supabase = createSupabaseClient(ctx.config)
    const creditUsageService = new CreditUsageService(supabase)

    await creditUsageService.create({
      user_id: ctx.session.userId,
      essay_upload_id: upload.id,
      credits_used: requiredCredit,
      description: `Document upload: ${fileName}`,
    })

    // Delete processing message
    await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)

    // Format file size
    const fileSizeKB = (document.file_size || 0) / 1024
    const fileSizeMB = fileSizeKB / 1024
    const formattedSize = fileSizeMB >= 1
      ? `${fileSizeMB.toFixed(2)} MB`
      : `${fileSizeKB.toFixed(2)} KB`

    // Get updated credit
    const updatedUser = await ctx.userService.findById(ctx.session.userId)
    const remainingCredit = Number(updatedUser?.credit) || 0

    // Create keyboard
    const keyboard = new InlineKeyboard()
      .text(ctx.t('upload-success-button-profile'), 'profile')
      .text(ctx.t('upload-success-button-home'), 'home')

    // Send success message with document info
    await ctx.reply(
      ctx.t('upload-success-credit', {
        fileName,
        fileSize: formattedSize,
        uploadId: upload.id.toString(),
        remainingCredit: remainingCredit.toString(),
      }),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
    )

    ctx.logger.info({
      uploadId: upload.id,
      userId: ctx.session.userId,
      fileName,
      fileSize: document.file_size,
      creditsUsed: requiredCredit,
      remainingCredit,
    }, 'Essay uploaded successfully with credit')
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to upload essay')
    await ctx.reply(ctx.t('upload-error'), {
      parse_mode: 'HTML',
    })
  }
})

// Handle /start with payment success/cancel
feature.command('start', logHandle('command-start-payment'), async (ctx) => {
  const startParam = ctx.match

  // Check if it's a payment callback
  if (startParam) {
    const paymentSuccessMatch = startParam.match(/payment_success_(\d+)/)
    const paymentCancelMatch = startParam.match(/payment_cancel_(\d+)/)

    if (paymentSuccessMatch) {
      const uploadId = Number(paymentSuccessMatch[1])
      await ctx.reply(ctx.t('payment-processing', { uploadId: uploadId.toString() }), {
        parse_mode: 'HTML',
      })
      return
    }

    if (paymentCancelMatch) {
      const uploadId = Number(paymentCancelMatch[1])
      await ctx.reply(ctx.t('payment-cancelled', { uploadId: uploadId.toString() }), {
        parse_mode: 'HTML',
      })
    }
  }
})

// Handle help button
feature.callbackQuery('help', logHandle('callback-help'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const keyboard = new InlineKeyboard()
    .text('📤 Upload Essay', 'upload_essay')
    .row()
    .text('🏠 Back to Home', 'home')

  await ctx.editMessageText(ctx.t('help-message'), {
    reply_markup: keyboard,
  })
})

// Handle home button
feature.callbackQuery('home', logHandle('callback-home'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const keyboard = new InlineKeyboard()
    .text(ctx.t('welcome-button-upload'), 'upload_essay')
    .row()
    .text(ctx.t('welcome-button-profile'), 'profile')
    .text(ctx.t('welcome-button-language'), 'change_language')
    .row()
    .text(ctx.t('welcome-button-help'), 'help')

  await ctx.editMessageText(ctx.t('welcome'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
})

export { composer as uploadFeature }
