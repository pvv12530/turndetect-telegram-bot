#!/usr/bin/env tsx
/* eslint-disable antfu/no-top-level-await */

import type { PollingConfig, WebhookConfig } from '#root/config.js'
import type { RunnerHandle } from '@grammyjs/runner'
import type { ScheduledTask } from 'node-cron'
import process from 'node:process'
import { createBot } from '#root/bot/index.js'
import { config } from '#root/config.js'
import { ServiceService } from '#root/db/services/service.service.js'
import { createSupabaseClient } from '#root/db/supabase.js'
import { logger } from '#root/logger.js'
import { createServer, createServerManager } from '#root/server/index.js'
import { MaintenanceCheckerService } from '#root/services/maintenance-checker.service.js'
import { run } from '@grammyjs/runner'
import cron from 'node-cron'

async function startPolling(config: PollingConfig) {
  const bot = createBot(config.botToken, {
    config,
    logger,
  })
  let runner: undefined | RunnerHandle
  let maintenanceCronJob: undefined | ScheduledTask

  // graceful shutdown
  onShutdown(async () => {
    logger.info('Shutdown')
    maintenanceCronJob?.stop()
    await runner?.stop()
  })

  await Promise.all([
    bot.init(),
    bot.api.deleteWebhook(),
  ])

  // start bot
  runner = run(bot, {
    runner: {
      fetch: {
        allowed_updates: config.botAllowedUpdates,
      },
    },
  })

  // start maintenance checker cron job
  maintenanceCronJob = startMaintenanceChecker()

  logger.info({
    msg: 'Bot running...',
    username: bot.botInfo.username,
  })
}

async function startWebhook(config: WebhookConfig) {
  const bot = createBot(config.botToken, {
    config,
    logger,
  })
  const server = createServer({
    bot,
    config,
    logger,
  })
  const serverManager = createServerManager(server, {
    host: config.serverHost,
    port: config.serverPort,
  })
  let maintenanceCronJob: undefined | ScheduledTask

  // graceful shutdown
  onShutdown(async () => {
    logger.info('Shutdown')
    maintenanceCronJob?.stop()
    await serverManager.stop()
  })

  // to prevent receiving updates before the bot is ready
  await bot.init()

  // start server
  const info = await serverManager.start()
  logger.info({
    msg: 'Server started',
    url: info.url,
  })

  // set webhook
  await bot.api.setWebhook(config.botWebhook, {
    allowed_updates: config.botAllowedUpdates,
    secret_token: config.botWebhookSecret,
  })
  logger.info({
    msg: 'Webhook was set',
    url: config.botWebhook,
  })

  // start maintenance checker cron job
  maintenanceCronJob = startMaintenanceChecker()
}

try {
  if (config.isWebhookMode)
    await startWebhook(config)
  else if (config.isPollingMode)
    await startPolling(config)
}
catch (error) {
  logger.error(error)
  process.exit(1)
}

// Utils

function startMaintenanceChecker(): ScheduledTask {
  const supabase = createSupabaseClient(config)
  const serviceService = new ServiceService(supabase)
  const maintenanceChecker = new MaintenanceCheckerService(serviceService, logger)

  // Run immediately on start
  maintenanceChecker.checkAndUpdateMaintenanceStatus().catch((error) => {
    logger.error({ error }, 'Failed to run initial maintenance check')
  })

  // Schedule to run every 10 minutes (cron: */10 * * * *)
  const job = cron.schedule('*/10 * * * *', async () => {
    await maintenanceChecker.checkAndUpdateMaintenanceStatus()
  }, {
    timezone: 'UTC',
  })

  logger.info('Maintenance checker cron job started (runs every 10 minutes)')

  return job
}

function onShutdown(cleanUp: () => Promise<void>) {
  let isShuttingDown = false
  const handleShutdown = async () => {
    if (isShuttingDown)
      return
    isShuttingDown = true
    await cleanUp()
  }
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
}
