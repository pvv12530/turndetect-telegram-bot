import type { Context } from '#root/bot/context.js'
import { Buffer } from 'node:buffer'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer, InlineKeyboard } from 'grammy'
import mammoth from 'mammoth'
import WordExtractor from 'word-extractor'

// Helper function to extract text from DOCX files
async function extractTextFromDocx(input: ArrayBuffer | Buffer): Promise<string> {
  try {
    const bufferSize = input instanceof Buffer ? input.length : input.byteLength
    // eslint-disable-next-line no-console
    console.warn(`[extractTextFromDocx] Starting extraction, buffer size: ${bufferSize}`)

    // Mammoth prefers Buffer over ArrayBuffer
    const buffer = input instanceof Buffer ? input : Buffer.from(new Uint8Array(input))
    // eslint-disable-next-line no-console
    console.warn(`[extractTextFromDocx] Using buffer of size: ${buffer.length}`)

    // First try extractRawText - this extracts plain text directly
    const rawTextResult = await mammoth.extractRawText({ buffer })
    // eslint-disable-next-line no-console
    console.warn(`[extractTextFromDocx] Raw text length: ${rawTextResult.value?.length || 0}, messages: ${rawTextResult.messages?.length || 0}`)

    if (rawTextResult.messages && rawTextResult.messages.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`[extractTextFromDocx] Mammoth messages:`, rawTextResult.messages)
    }

    if (rawTextResult.value && rawTextResult.value.trim().length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`[extractTextFromDocx] Successfully extracted ${rawTextResult.value.length} chars via extractRawText`)
      return rawTextResult.value
    }

    // If extractRawText doesn't work or returns empty, try convertToHtml and extract text
    // eslint-disable-next-line no-console
    console.warn(`[extractTextFromDocx] Trying convertToHtml fallback`)
    const htmlResult = await mammoth.convertToHtml({ buffer })
    // eslint-disable-next-line no-console
    console.warn(`[extractTextFromDocx] HTML result length: ${htmlResult.value?.length || 0}`)

    if (htmlResult.value) {
      // Strip HTML tags and extract text
      const textContent = htmlResult.value
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&') // Replace &amp; with &
        .replace(/&lt;/g, '<') // Replace &lt; with <
        .replace(/&gt;/g, '>') // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .replace(/&#39;/g, '\'') // Replace &#39; with '
        .replace(/&#x27;/g, '\'') // Replace &#x27; with '
        .replace(/&#x2F;/g, '/') // Replace &#x2F; with /
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()

      if (textContent.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[extractTextFromDocx] Successfully extracted ${textContent.length} chars via convertToHtml`)
        return textContent
      }
    }

    throw new Error('Unable to extract text from document - both methods returned empty content')
  }
  catch (error) {
    console.error(`[extractTextFromDocx] Error:`, error)
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to extract text from DOC files (binary format)
async function extractTextFromDoc(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const extractor = new WordExtractor()
    const buffer = Buffer.from(arrayBuffer)

    const extracted = await extractor.extract(buffer)
    const textContent = extracted.getBody().trim()

    if (!textContent || textContent.length === 0) {
      throw new Error('No text content found in document')
    }

    return textContent
  }
  catch (error) {
    throw new Error(`Failed to extract text from DOC: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

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
    // Check user
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user) {
      ctx.logger.error({ userId: ctx.session.userId }, 'User not found in database')
      await ctx.reply(ctx.t('upload-error'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Check if user is already analyzing
    if (user.analyzing_status) {
      await ctx.reply(ctx.t('upload-analyzing-in-progress'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Check document format
    const fileName = document.file_name || ''
    const fileNameLower = fileName.toLowerCase()
    const isDocx = fileNameLower.endsWith('.docx')
      || document.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isDoc = fileNameLower.endsWith('.doc')
      || document.mime_type === 'application/msword'

    // Check if service is selected (from service button click)
    const selectedServiceButtonId = ctx.session.selectedServiceButtonId
    if (!selectedServiceButtonId) {
      // Query services from database
      let services: Array<{ id: string, name: string | null, status: boolean | null, service_button_id: string | null }> = []
      try {
        const servicesList = await ctx.serviceService.findAll()
        services = servicesList.map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
          service_button_id: s.service_button_id,
        }))
      }
      catch (error) {
        ctx.logger.error({ error }, 'Failed to fetch services')
      }

      // Build keyboard with services
      const keyboard = new InlineKeyboard()

      // Add service buttons
      if (services.length > 0) {
        for (const service of services) {
          if (service.service_button_id && service.name) {
            const statusEmoji = service.status ? '✅' : '❌'
            keyboard.text(`${statusEmoji} ${service.name}`, service.service_button_id)
          }
        }
        keyboard.row()
      }

      // Add home button
      keyboard.text(ctx.t('upload-success-button-home'), 'home')

      await ctx.reply(ctx.t('upload-no-service-selected'), {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      })
      return
    }

    // Special handling for originality service - accepts .doc and .docx
    const isOriginalityService = selectedServiceButtonId === 'service-button-originality'
    if (isOriginalityService) {
      if (!isDocx && !isDoc) {
        await ctx.reply(ctx.t('upload-ai-report-format-error'), {
          parse_mode: 'HTML',
        })
        return
      }
    }
    else {
      // Other services only accept DOCX
      if (!isDocx) {
        await ctx.reply(ctx.t('upload-docx-format-error'), {
          parse_mode: 'HTML',
        })
        return
      }
    }

    // Get service details
    const service = await ctx.serviceService.findByButtonId(selectedServiceButtonId)
    if (!service || !service.status) {
      await ctx.reply(ctx.t('upload-service-not-available'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Handle originality service workflow
    if (isOriginalityService) {
      // Originality service requires payment workflow
      if (!ctx.originalityService) {
        await ctx.reply(ctx.t('upload-ai-report-not-configured'), {
          parse_mode: 'HTML',
        })
        return
      }

      // Set analyzing status to true
      await ctx.userService.setAnalyzingStatus(ctx.session.userId, true)

      // Show processing message
      const processingMsg = await ctx.reply(ctx.t('upload-processing'), {
        parse_mode: 'HTML',
      })

      // Download file from Telegram and save to /files/ folder
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      const process = await import('node:process')

      // Get file from Telegram
      const file = await ctx.api.getFile(document.file_id)

      if (!file.file_path) {
        await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
        throw new Error('File path not available')
      }

      // Download file from Telegram
      const fileUrl = `https://api.telegram.org/file/bot${ctx.config.botToken}/${file.file_path}`
      const response = await fetch(fileUrl)
      const arrayBuffer = await response.arrayBuffer()
      const downloadedBuffer = Buffer.from(arrayBuffer)

      // Save to /files/ folder
      const filesDir = path.join(process.cwd(), 'files')
      const timestamp = Date.now()
      const savedFileName = `${timestamp}_${fileName}`
      const savedFilePath = path.join(filesDir, savedFileName)

      try {
        // Ensure /files/ directory exists
        await fs.mkdir(filesDir, { recursive: true })
        // Write file to /files/ folder
        await fs.writeFile(savedFilePath, downloadedBuffer)
        ctx.logger.info({ savedFilePath, fileSize: downloadedBuffer.length }, 'File saved to /files/ folder')
      }
      catch (error) {
        await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
        await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
        const errorMessage = error instanceof Error ? error.message : String(error)
        ctx.logger.error({ error, errorMessage, savedFilePath }, 'Failed to save file to /files/ folder')
        await ctx.reply(ctx.t('upload-error-save-file', { errorMessage }), {
          parse_mode: 'HTML',
        })
        return
      }

      // Read the saved file
      let fileBuffer: Buffer
      try {
        ctx.logger.info({ savedFilePath }, 'Reading file from /files/ folder')
        fileBuffer = await fs.readFile(savedFilePath)
        ctx.logger.info({ fileSize: fileBuffer.length }, 'File read successfully from /files/ folder')
      }
      catch (error) {
        await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
        await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
        const errorMessage = error instanceof Error ? error.message : String(error)
        ctx.logger.error({ error, errorMessage, savedFilePath }, 'Failed to read file from /files/ folder')
        await ctx.reply(ctx.t('upload-error-read-file', { errorMessage }), {
          parse_mode: 'HTML',
        })
        return
      }

      // Read document content and count words
      let textContent = ''
      let wordCount = 0

      try {
        ctx.logger.info({ bufferSize: fileBuffer.length }, 'TESTING: Starting text extraction')
        // Test file is .docx - pass Buffer directly to mammoth
        textContent = await extractTextFromDocx(fileBuffer)
        ctx.logger.info({ textLength: textContent.length }, 'TESTING: Text extracted from test file')

        // Count words (simple word count)
        wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length

        if (wordCount === 0) {
          await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
          await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
          await ctx.reply(ctx.t('upload-error-extract-text-empty'), {
            parse_mode: 'HTML',
          })
          return
        }

        // Log extracted text length for debugging
        ctx.logger.info({
          fileName,
          savedFilePath,
          textLength: textContent.length,
          wordCount,
        }, 'Text extracted from document')
      }
      catch (error) {
        await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
        await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        ctx.logger.error({ error, errorMessage, errorStack, fileName, savedFilePath }, 'Failed to extract text from document')
        await ctx.reply(ctx.t('upload-error-extract-text', { errorMessage }), {
          parse_mode: 'HTML',
        })
        return
      }

      // Calculate credits needed based on word count
      let requiredCredits = 1
      if (wordCount > 6000) {
        requiredCredits = 3
      }
      else if (wordCount > 3000) {
        requiredCredits = 2
      }
      else {
        requiredCredits = 1
      }

      // Get user's current credit balance
      const currentCredit = Number(user.credit) || 0

      // Delete processing message
      await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)

      // Reset analyzing status
      await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)

      // Generate unique file path for Supabase storage
      const supabaseTimestamp = Date.now()
      const filePath = `essays/${ctx.from.id}/${supabaseTimestamp}_${fileName}`

      // Upload to Supabase storage (convert Buffer to ArrayBuffer for storage)
      const supabaseArrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer
      await ctx.essayService.uploadFile(
        'essays',
        filePath,
        supabaseArrayBuffer,
        document.mime_type || (isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword'),
      )

      // Log upload to database
      const upload = await ctx.essayService.createUpload({
        user_id: ctx.session.userId,
        file_name: fileName,
        file_size: fileBuffer.length,
        file_path: filePath,
        mime_type: document.mime_type || null,
        payment_status: 'not_paid',
        status: 'queued',
      })

      // Store in session for callback
      ctx.session.originalityUploadId = upload.id
      ctx.session.originalityWordCount = wordCount
      ctx.session.originalityCreditsRequired = requiredCredits

      // Check if user has enough credits
      if (currentCredit >= requiredCredits) {
        // User has enough credits - ask for confirmation
        const keyboard = new InlineKeyboard()
          .text(ctx.t('upload-button-continue'), `originality_confirm_${upload.id}`)
          .text(ctx.t('upload-button-cancel'), `originality_cancel_${upload.id}`)
          .row()
          .text(ctx.t('upload-button-back-home'), 'home')

        await ctx.reply(
          ctx.t('upload-originality-confirmation', {
            fileName,
            wordCount: wordCount.toLocaleString(),
            requiredCredits: requiredCredits.toString(),
            currentCredit: currentCredit.toString(),
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
          wordCount,
          requiredCredits,
          currentCredit,
        }, 'Originality credit confirmation requested')
      }
      else {
        // User doesn't have enough credits - ask to buy
        const keyboard = new InlineKeyboard()
          .text(ctx.t('upload-button-buy-credits'), 'buy_credit')
          .row()
          .text(ctx.t('upload-button-back-home'), 'home')

        await ctx.reply(
          ctx.t('upload-originality-insufficient-credits', {
            fileName,
            wordCount: wordCount.toLocaleString(),
            requiredCredits: requiredCredits.toString(),
            currentCredit: currentCredit.toString(),
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
          wordCount,
          requiredCredits,
          currentCredit,
        }, 'Originality insufficient credits')
      }

      // Clean up: Delete the file from /files/ folder after processing
      try {
        await fs.unlink(savedFilePath)
        ctx.logger.info({ savedFilePath }, 'Cleaned up file from /files/ folder')
      }
      catch (cleanupError) {
        ctx.logger.error({ error: cleanupError, savedFilePath }, 'Failed to clean up file from /files/ folder')
      }

      return
    }

    // Handle other services (existing workflow)
    // Check user credit for non-originality services
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

    // Set analyzing status to true
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, true)

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
    const filePath = `essays/${ctx.from.id}/${timestamp}_${fileName}`

    // Upload to Supabase storage
    await ctx.essayService.uploadFile(
      'essays',
      filePath,
      arrayBuffer,
      document.mime_type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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

    // Handle different service types
    const isTurnitinService = selectedServiceButtonId === 'service-button-turnitin'

    if (isTurnitinService) {
      // Use current workflow for Turnitin service
      // Format file size
      const fileSizeKB = (document.file_size || 0) / 1024
      const fileSizeMB = fileSizeKB / 1024
      const formattedSize = fileSizeMB >= 1
        ? `${fileSizeMB.toFixed(2)} MB`
        : `${fileSizeKB.toFixed(2)} KB`

      // Get updated credit
      const updatedUser = await ctx.userService.findById(ctx.session.userId)
      const remainingCredit = Number(updatedUser?.credit) || 0

      // Reset analyzing status
      await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
      ctx.session.selectedServiceButtonId = undefined

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
        service: 'turnitin',
      }, 'Essay uploaded successfully with credit')
    }
    else {
      // Unknown service - reset analyzing status
      await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
      ctx.session.selectedServiceButtonId = undefined
      throw new Error('Unknown service type')
    }
  }
  catch (error) {
    // Reset analyzing status on error
    if (ctx.session.userId) {
      try {
        await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
      }
      catch (resetError) {
        ctx.logger.error({ error: resetError }, 'Failed to reset analyzing status')
      }
    }
    ctx.logger.error({ error }, 'Failed to upload essay')
    await ctx.reply(ctx.t('upload-error'), {
      parse_mode: 'HTML',
    })
  }
})

// Handle originality confirmation callback
feature.callbackQuery(/^originality_confirm_(\d+)$/, logHandle('callback-originality-confirm'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const uploadId = Number(ctx.match[1])

  if (!ctx.session.userId || !ctx.originalityService) {
    await ctx.reply(ctx.t('upload-error-processing-request'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    // Get upload details
    const upload = await ctx.essayService.getUploadById(uploadId)
    if (!upload || upload.user_id !== ctx.session.userId) {
      await ctx.reply(ctx.t('upload-error-not-found'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Get word count and credits from session
    const wordCount = ctx.session.originalityWordCount || 0
    const requiredCredits = ctx.session.originalityCreditsRequired || 1

    // Get user to check credit balance again
    const user = await ctx.userService.findById(ctx.session.userId)
    if (!user) {
      await ctx.reply(ctx.t('upload-error-user-not-found'), {
        parse_mode: 'HTML',
      })
      return
    }

    const currentCredit = Number(user.credit) || 0
    if (currentCredit < requiredCredits) {
      await ctx.reply(ctx.t('upload-error-insufficient-credits-retry'), {
        parse_mode: 'HTML',
      })
      return
    }

    // Set analyzing status
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, true)

    // Show processing message
    const processingMsg = await ctx.reply(ctx.t('upload-originality-processing'), {
      parse_mode: 'HTML',
    })

    // Download file from Supabase storage
    const { createSupabaseClient } = await import('#root/db/supabase.js')
    const supabase = createSupabaseClient(ctx.config)
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('essays')
      .download(upload.file_path)

    if (downloadError || !fileData) {
      await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
      if (ctx.chat) {
        await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
      }
      throw new Error(ctx.t('upload-error-download-storage'))
    }

    const arrayBuffer = await fileData.arrayBuffer()

    // Read document content
    let textContent = ''
    const fileNameLower = upload.file_name.toLowerCase()
    const isDocx = fileNameLower.endsWith('.docx')
    const isDoc = fileNameLower.endsWith('.doc')

    try {
      if (isDocx) {
        // Use mammoth for DOCX files (Office Open XML format)
        textContent = await extractTextFromDocx(arrayBuffer)
      }
      else if (isDoc) {
        // Use word-extractor for DOC files (binary format)
        textContent = await extractTextFromDoc(arrayBuffer)
      }
      else {
        throw new Error(ctx.t('upload-error-unsupported-format'))
      }

      if (!textContent || textContent.trim().length === 0) {
        throw new Error(ctx.t('upload-error-no-text-content'))
      }
    }
    catch (error) {
      await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
      if (ctx.chat) {
        await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
      }
      ctx.logger.error({ error, uploadId, fileName: upload.file_name }, 'Failed to read document content')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(ctx.t('upload-error-read-content', { errorMessage }))
    }

    // Create originality API log entry
    const apiLog = await ctx.originalityLogService.create({
      user_id: ctx.session.userId,
      essay_upload_id: uploadId,
      word_count: wordCount,
      credits_used: requiredCredits,
      status: 'pending',
      request_data: {
        title: upload.file_name,
        word_count: wordCount,
      },
    })

    // Call Originality.ai API
    const scanRequest = {
      title: upload.file_name,
      check_ai: true,
      check_plagiarism: false,
      check_facts: false,
      check_readability: false,
      check_grammar: false,
      check_contentOptimizer: false,
      storeScan: true,
      excludedUrls: [],
      aiModelVersion: 'lite-102',
      content: textContent,
    }

    const scanResponse = await ctx.originalityService.scanContent(scanRequest)

    // Extract AI score and confidence
    const aiScore = scanResponse.results.ai.classification.AI
    const aiConfidence = scanResponse.results.ai.confidence.AI
    const publicLink = scanResponse.results.properties.publicLink
    const scanId = scanResponse.results.properties.id

    // Update API log with response
    await ctx.originalityLogService.update(apiLog.id, {
      response_data: scanResponse as any,
      ai_score: aiScore,
      ai_confidence: aiConfidence,
      public_link: publicLink,
      scan_id: scanId,
      status: 'completed',
    })

    // Deduct credits
    await ctx.userService.deductCredit(ctx.session.userId, requiredCredits)

    // Log credit usage
    const { CreditUsageService } = await import('#root/db/services/credit-usage.service.js')
    const { createSupabaseClient: createSupabaseClient2 } = await import('#root/db/supabase.js')
    const supabase2 = createSupabaseClient2(ctx.config)
    const creditUsageService = new CreditUsageService(supabase2)

    await creditUsageService.create({
      user_id: ctx.session.userId,
      essay_upload_id: uploadId,
      credits_used: requiredCredits,
      description: `Originality.ai analysis: ${upload.file_name}`,
    })

    // Update upload status
    await ctx.essayService.updateStatus(uploadId, 'completed')
    // Update payment status
    const { createSupabaseClient: createSupabaseClient3 } = await import('#root/db/supabase.js')
    const supabase3 = createSupabaseClient3(ctx.config)
    await supabase3
      .from('essay_uploads')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploadId)

    // Delete processing message
    if (ctx.chat) {
      await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
    }

    // Reset analyzing status
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)

    // Get updated credit balance
    const updatedUser = await ctx.userService.findById(ctx.session.userId)
    const remainingCredit = Number(updatedUser?.credit) || 0

    // Clear session
    ctx.session.originalityUploadId = undefined
    ctx.session.originalityWordCount = undefined
    ctx.session.originalityCreditsRequired = undefined
    ctx.session.selectedServiceButtonId = undefined

    // Create keyboard
    const keyboard = new InlineKeyboard()
    if (publicLink) {
      keyboard.url(ctx.t('originality-analysis-view-report'), publicLink).row()
    }
    keyboard
      .text(ctx.t('upload-success-button-profile'), 'profile')
      .text(ctx.t('upload-success-button-home'), 'home')

    // Format AI score as percentage
    const aiScorePercent = (aiScore * 100).toFixed(2)
    const originalScorePercent = ((1 - aiScore) * 100).toFixed(2)
    const confidencePercent = (aiConfidence * 100).toFixed(2)

    // Build result message using locale
    const messageParts = [
      ctx.t('originality-analysis-completed'),
      '',
      ctx.t('originality-analysis-file', { fileName: upload.file_name }),
      ctx.t('originality-analysis-word-count', { wordCount: wordCount.toLocaleString() }),
      '',
      ctx.t('originality-analysis-results-title'),
      ctx.t('originality-analysis-ai-score', { aiScore: aiScorePercent }),
      ctx.t('originality-analysis-original-score', { originalScore: originalScorePercent }),
      ctx.t('originality-analysis-confidence', { confidence: confidencePercent }),
      '',
    ]

    if (publicLink) {
      messageParts.push(ctx.t('originality-analysis-full-report', { publicLink }), '')
    }

    messageParts.push(
      ctx.t('originality-analysis-credits-used', { creditsUsed: requiredCredits }),
      ctx.t('originality-analysis-remaining-credits', { remainingCredits: remainingCredit }),
    )

    const resultMessage = messageParts.join('\n')

    await ctx.reply(resultMessage, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })

    ctx.logger.info({
      uploadId,
      userId: ctx.session.userId,
      fileName: upload.file_name,
      wordCount,
      aiScore,
      scanId,
      creditsUsed: requiredCredits,
      remainingCredit,
      service: 'originality',
    }, 'Originality analysis completed with credits')
  }
  catch (error) {
    // Reset analyzing status on error
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
    // Update API log with error
    try {
      const existingLog = await ctx.originalityLogService.findByUploadId(uploadId)
      if (existingLog) {
        await ctx.originalityLogService.update(existingLog.id, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
    catch (logError) {
      ctx.logger.error({ error: logError }, 'Failed to update API log with error')
    }

    ctx.logger.error({ error, uploadId }, 'Failed to process originality confirmation')
    await ctx.reply(ctx.t('upload-error-process-failed'), {
      parse_mode: 'HTML',
    })
  }
})

// Handle originality cancel callback
feature.callbackQuery(/^originality_cancel_(\d+)$/, logHandle('callback-originality-cancel'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const uploadId = Number(ctx.match[1])

  // Clear session if this was the current upload
  if (ctx.session.originalityUploadId === uploadId) {
    ctx.session.originalityUploadId = undefined
    ctx.session.originalityWordCount = undefined
    ctx.session.originalityCreditsRequired = undefined
  }

  const keyboard = new InlineKeyboard()
    .text(ctx.t('upload-button-back-home'), 'home')

  await ctx.reply(ctx.t('upload-originality-cancelled'), {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  })
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
      // Check if this is an originality service upload
      const upload = await ctx.essayService.getUploadById(uploadId)
      if (upload && upload.payment_status === 'not_paid') {
        // This might be an originality service payment
        // Check if we have originality log or session data
        const originalityLog = await ctx.originalityLogService.findByUploadId(uploadId)
        if (originalityLog || ctx.session.originalityUploadId === uploadId) {
          // Handle originality payment success
          await handleOriginalityPaymentSuccess(ctx, uploadId, upload)
          return
        }
      }

      await ctx.reply(ctx.t('payment-processing', { uploadId: uploadId.toString() }), {
        parse_mode: 'HTML',
      })
      return
    }

    if (paymentCancelMatch) {
      const uploadId = Number(paymentCancelMatch[1])
      // Reset session if it was originality service
      if (ctx.session.originalityUploadId === uploadId) {
        ctx.session.originalityUploadId = undefined
        ctx.session.originalityWordCount = undefined
        ctx.session.originalityCreditsRequired = undefined
      }
      await ctx.reply(ctx.t('payment-cancelled', { uploadId: uploadId.toString() }), {
        parse_mode: 'HTML',
      })
    }
  }
})

// Handle originality payment success and API call
async function handleOriginalityPaymentSuccess(ctx: Context, uploadId: number, upload: any) {
  if (!ctx.session.userId || !ctx.originalityService) {
    await ctx.reply(ctx.t('upload-error-payment-processing'), {
      parse_mode: 'HTML',
    })
    return
  }

  try {
    // Set analyzing status
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, true)

    // Show processing message
    const processingMsg = await ctx.reply(ctx.t('upload-originality-processing'), {
      parse_mode: 'HTML',
    })

    // Get word count and credits from session or log
    let wordCount = ctx.session.originalityWordCount || 0
    let requiredCredits = ctx.session.originalityCreditsRequired || 1

    // If not in session, try to get from existing log
    if (wordCount === 0) {
      const existingLog = await ctx.originalityLogService.findByUploadId(uploadId)
      if (existingLog) {
        wordCount = existingLog.word_count
        requiredCredits = existingLog.credits_used
      }
    }

    // Download file from Supabase storage
    const { createSupabaseClient } = await import('#root/db/supabase.js')
    const supabase = createSupabaseClient(ctx.config)
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('essays')
      .download(upload.file_path)

    if (downloadError || !fileData) {
      throw new Error(ctx.t('upload-error-download-storage'))
    }

    const arrayBuffer = await fileData.arrayBuffer()

    // Read document content
    let textContent = ''
    const fileNameLower = upload.file_name.toLowerCase()
    const isDocx = fileNameLower.endsWith('.docx')
    const isDoc = fileNameLower.endsWith('.doc')

    try {
      if (isDocx) {
        // Use mammoth for DOCX files (Office Open XML format)
        textContent = await extractTextFromDocx(arrayBuffer)
      }
      else if (isDoc) {
        // Use word-extractor for DOC files (binary format)
        textContent = await extractTextFromDoc(arrayBuffer)
      }
      else {
        throw new Error(ctx.t('upload-error-unsupported-format'))
      }

      if (!textContent || textContent.trim().length === 0) {
        throw new Error(ctx.t('upload-error-no-text-content'))
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(ctx.t('upload-error-read-content', { errorMessage }))
    }

    // Create originality API log entry
    const apiLog = await ctx.originalityLogService.create({
      user_id: ctx.session.userId,
      essay_upload_id: uploadId,
      word_count: wordCount,
      credits_used: requiredCredits,
      status: 'pending',
      request_data: {
        title: upload.file_name,
        word_count: wordCount,
      },
    })

    // Call Originality.ai API
    const scanRequest = {
      title: upload.file_name,
      check_ai: true,
      check_plagiarism: false,
      check_facts: false,
      check_readability: false,
      check_grammar: false,
      check_contentOptimizer: false,
      storeScan: true,
      excludedUrls: [],
      aiModelVersion: 'lite-102',
      content: textContent,
    }

    const scanResponse = await ctx.originalityService.scanContent(scanRequest)

    // Extract AI score and confidence
    const aiScore = scanResponse.results.ai.classification.AI
    const aiConfidence = scanResponse.results.ai.confidence.AI
    const publicLink = scanResponse.results.properties.publicLink
    const scanId = scanResponse.results.properties.id

    // Update API log with response
    await ctx.originalityLogService.update(apiLog.id, {
      response_data: scanResponse as any,
      ai_score: aiScore,
      ai_confidence: aiConfidence,
      public_link: publicLink,
      scan_id: scanId,
      status: 'completed',
    })

    // Update upload status and payment status
    await ctx.essayService.updateStatus(uploadId, 'completed')
    // Update payment status via Supabase directly
    const { createSupabaseClient: createSupabaseClient2 } = await import('#root/db/supabase.js')
    const supabase2 = createSupabaseClient2(ctx.config)
    await supabase2
      .from('essay_uploads')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploadId)

    // Delete processing message
    if (ctx.chat) {
      await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id)
    }

    // Reset analyzing status
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)

    // Clear session
    ctx.session.originalityUploadId = undefined
    ctx.session.originalityWordCount = undefined
    ctx.session.originalityCreditsRequired = undefined
    ctx.session.selectedServiceButtonId = undefined

    // Get updated credit balance
    const updatedUser = await ctx.userService.findById(ctx.session.userId)
    const remainingCredit = Number(updatedUser?.credit) || 0

    // Create keyboard
    const keyboard = new InlineKeyboard()
    if (publicLink) {
      keyboard.url(ctx.t('originality-analysis-view-report'), publicLink).row()
    }
    keyboard
      .text(ctx.t('upload-success-button-profile'), 'profile')
      .text(ctx.t('upload-success-button-home'), 'home')

    // Format AI score as percentage
    const aiScorePercent = (aiScore * 100).toFixed(2)
    const originalScorePercent = ((1 - aiScore) * 100).toFixed(2)
    const confidencePercent = (aiConfidence * 100).toFixed(2)

    // Build result message using locale
    const messageParts = [
      ctx.t('originality-analysis-completed'),
      '',
      ctx.t('originality-analysis-file', { fileName: upload.file_name }),
      ctx.t('originality-analysis-word-count', { wordCount: wordCount.toLocaleString() }),
      '',
      ctx.t('originality-analysis-results-title'),
      ctx.t('originality-analysis-ai-score', { aiScore: aiScorePercent }),
      ctx.t('originality-analysis-original-score', { originalScore: originalScorePercent }),
      ctx.t('originality-analysis-confidence', { confidence: confidencePercent }),
      '',
    ]

    if (publicLink) {
      messageParts.push(ctx.t('originality-analysis-full-report', { publicLink }), '')
    }

    messageParts.push(
      ctx.t('originality-analysis-credits-used', { creditsUsed: requiredCredits }),
      ctx.t('originality-analysis-remaining-credits', { remainingCredits: remainingCredit }),
    )

    const resultMessage = messageParts.join('\n')

    await ctx.reply(resultMessage, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })

    ctx.logger.info({
      uploadId,
      userId: ctx.session.userId,
      fileName: upload.file_name,
      wordCount,
      aiScore,
      scanId,
      service: 'originality',
    }, 'Originality analysis completed')
  }
  catch (error) {
    // Reset analyzing status on error
    await ctx.userService.setAnalyzingStatus(ctx.session.userId, false)
    // Update API log with error
    try {
      const existingLog = await ctx.originalityLogService.findByUploadId(uploadId)
      if (existingLog) {
        await ctx.originalityLogService.update(existingLog.id, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
    catch (logError) {
      ctx.logger.error({ error: logError }, 'Failed to update API log with error')
    }

    ctx.logger.error({ error, uploadId }, 'Failed to process originality payment')
    await ctx.reply(ctx.t('upload-error-process-failed'), {
      parse_mode: 'HTML',
    })
  }
}

// Handle help button
feature.callbackQuery('help', logHandle('callback-help'), async (ctx) => {
  await ctx.answerCallbackQuery()

  const keyboard = new InlineKeyboard()
    .text(ctx.t('welcome-button-upload'), 'upload_essay')
    .row()
    .text(ctx.t('upload-button-back-home'), 'home')

  await ctx.editMessageText(ctx.t('help-message'), {
    reply_markup: keyboard,
  })
})

// Handle home button
feature.callbackQuery('home', logHandle('callback-home'), async (ctx) => {
  await ctx.answerCallbackQuery()

  // Query services from database
  let services: Array<{ id: string, name: string | null, status: boolean | null, service_button_id: string | null }> = []
  try {
    const servicesList = await ctx.serviceService.findAll()
    services = servicesList.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      service_button_id: s.service_button_id,
    }))
  }
  catch (error) {
    ctx.logger.error({ error }, 'Failed to fetch services')
  }

  // Build keyboard with services
  const keyboard = new InlineKeyboard()

  // Add service buttons
  if (services.length > 0) {
    for (const service of services) {
      if (service.service_button_id && service.name) {
        const statusEmoji = service.status ? '✅' : '❌'
        keyboard.text(`${statusEmoji} ${service.name}`, service.service_button_id)
      }
    }
    keyboard.row()
  }

  // Add other buttons
  keyboard
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

export { composer as uploadFeature }
