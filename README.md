<h1 align="center">📝 Turnitin Pro Essay Analyzer Telegram Bot</h1>

A Telegram bot for plagiarism detection and essay analysis using Turnitin's technology. Users can upload essays, purchase credits, and receive detailed similarity reports.

## Features

- 📤 **Essay Upload**: Upload documents (.doc, .docx) for plagiarism analysis
- 💳 **Credit-Based System**: Purchase credits (1 credit = 20 HKD) to analyze essays
- 💰 **Stripe Integration**: Secure payment processing via Stripe
- 🗄️ **Supabase Database**: User management, transaction tracking, and file storage
- 🌐 **Multi-language Support**: English and Chinese (Traditional/Simplified)
- 👤 **User Profile**: View credit balance and purchase history
- 💬 **Feedback System**: Collect user feedback to improve service
- 🔐 **Admin Commands**: Admin-only commands for bot management
- 📊 **Transaction Tracking**: Complete payment and credit usage history
- 🚀 **Scalable Architecture**: Built with grammY framework and Hono server
- 📝 **Structured Logging**: Powered by Pino logger

## Setup Guide

### Prerequisites

- Node.js >= 20.0.0
- npm >= 8.0.0
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- A Supabase project with database tables set up
- A Stripe account with API keys

### Installation

1. **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd turndetect-telegram-bot
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Variables Setup**

    Create a `.env` file in the root directory with the following variables:

    ```env
    # Required
    BOT_TOKEN=your_telegram_bot_token
    BOT_MODE=polling  # or 'webhook'
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_KEY=your_supabase_anon_key
    STRIPE_SECRET_KEY=your_stripe_secret_key

    # Optional
    BOT_USERNAME=your_bot_username
    STRIPE_PRICE=2000  # Price in cents (default: not set)
    STRIPE_CURRENCY=usd  # Default: 'usd'
    LOG_LEVEL=info  # Default: 'info'
    DEBUG=false  # Default: 'false'
    BOT_ADMINS=[123456789]  # JSON array of admin user IDs
    BOT_ALLOWED_UPDATES=[]  # JSON array of allowed update types

    # Required for webhook mode only
    BOT_WEBHOOK=https://your-domain.com/webhook
    BOT_WEBHOOK_SECRET=your_webhook_secret_token
    SERVER_HOST=0.0.0.0  # Default: '0.0.0.0'
    SERVER_PORT=80  # Default: 80
    ```

4. **Database Setup**

    Ensure your Supabase database has the following tables:
    - `users` - User information and credit balance
    - `essay_uploads` - Essay upload records
    - `transactions` - Payment transaction records
    - `credit_usage` - Credit usage history
    - `feedback` - User feedback records

    Also ensure you have a Supabase Storage bucket named `essays` for file storage.

5. **Launching the Bot**

    **Development Mode:**

    Start the bot in watch mode (auto-reload when code changes):
    ```bash
    npm run dev
    ```

    **Production Mode:**

    Build the project:
    ```bash
    npm run build
    ```

    Start the bot:
    ```bash
    npm run start:force  # skip type checking and start
    # or
    npm start  # with type checking (requires dev dependencies)
    ```

### List of Available Commands

- `npm run lint` — Lint source code.
- `npm run format` — Format source code.
- `npm run typecheck` — Run type checking.
- `npm run dev` — Start the bot in development mode.
- `npm run start` — Start the bot.
- `npm run start:force` — Starts the bot without type checking.

### Directory Structure

```
project-root/
  ├── locales/              # Localization files (en.ftl, zh.ftl)
  ├── build/                # Compiled JavaScript files
  └── src/
      ├── bot/              # Bot-related code
      │   ├── callback-data/    # Callback data builders
      │   ├── features/         # Bot features (admin, credit, feedback, language, profile, upload, welcome)
      │   ├── filters/          # Update filters (is-admin)
      │   ├── handlers/         # Update handlers (commands, error)
      │   ├── helpers/          # Helper functions (keyboard, logging)
      │   ├── keyboards/        # Keyboard builders
      │   ├── middlewares/      # Bot middlewares (session, update-logger, user-session)
      │   ├── i18n.ts           # Internationalization setup
      │   ├── context.ts        # Context object definition
      │   └── index.ts          # Bot entry point
      ├── db/                # Database-related code
      │   ├── services/         # Database services (credit-usage, essay, feedback, transaction, user)
      │   ├── supabase.ts       # Supabase client setup
      │   └── types.ts          # Database type definitions
      ├── payment/            # Payment integration
      │   └── stripe.service.ts # Stripe service
      ├── server/             # Web server code
      │   ├── middlewares/      # Server middlewares (logger, request-id, request-logger)
      │   ├── environment.ts    # Server environment setup
      │   └── index.ts          # Server entry point
      ├── config.ts            # Application configuration
      ├── logger.ts            # Logging setup
      └── main.ts              # Application entry point
```

## Usage

### Bot Commands

- `/start` - Start the bot and see the welcome message
- `/language` - Change the bot's language (if multiple locales are available)
- `/setcommands` - Set bot commands (admin only)

### User Flow

1. **Start the Bot**: Users send `/start` to begin
2. **Upload Essay**: Click "Upload Essay" button or send a document directly
3. **Purchase Credits**: If credits are insufficient, users can purchase credits (1 credit = 20 HKD)
4. **View Profile**: Check credit balance and purchase history
5. **Provide Feedback**: Share feedback about the service

### Credit System

- Each essay upload costs **1 credit**
- Credits can be purchased in packages:
  - 10 credits for 200 HKD
  - 100 credits for 2000 HKD
  - Custom amount (minimum 1 credit)

### Supported File Formats

- `.doc` - Microsoft Word 97-2003
- `.docx` - Microsoft Word 2007+
- `.pdf` - Portable Document Format
- `.txt` - Plain text

**Maximum file size**: 20MB

## Environment Variables

<table>
<thead>
  <tr>
    <th>Variable</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>BOT_TOKEN</td>
    <td>
        String
    </td>
    <td>
        Telegram Bot API token obtained from <a href="https://t.me/BotFather">@BotFather</a>.
    </td>
  </tr>
  <tr>
    <td>BOT_MODE</td>
    <td>
        String
    </td>
    <td>
        Specifies method to receive incoming updates (<code>polling</code> or <code>webhook</code>).
    </td>
  </tr>
  <tr>
    <td>LOG_LEVEL</td>
    <td>
        String
    </td>
    <td>
        <i>Optional.</i>
        Specifies the application log level. <br/>
        Use <code>info</code> for general logging. Check the <a href="https://github.com/pinojs/pino/blob/master/docs/api.md#level-string">Pino documentation</a> for more log level options. <br/>
        Defaults to <code>info</code>.
    </td>
  </tr>
  <tr>
    <td>DEBUG</td>
    <td>Boolean</td>
    <td>
      <i>Optional.</i>
      Enables debug mode. You may use <code>config.isDebug</code> flag to enable debugging functions.
    </td>
  </tr>
  <tr>
    <td>BOT_WEBHOOK</td>
    <td>
        String
    </td>
    <td>
        <i>Optional in <code>polling</code> mode.</i>
        Webhook endpoint URL, used to configure webhook.
    </td>
  </tr>
  <tr>
    <td>BOT_WEBHOOK_SECRET</td>
    <td>
        String
    </td>
    <td>
        <i>Optional in <code>polling</code> mode.</i>
        A secret token that is used to ensure that a request is sent from Telegram, used to configure webhook.
    </td>
  </tr>
  <tr>
    <td>SERVER_HOST</td>
    <td>
        String
    </td>
    <td>
        <i>Optional in <code>polling</code> mode.</i> Specifies the server hostname. <br/>
        Defaults to <code>0.0.0.0</code>.
    </td>
  </tr>
  <tr>
    <td>SERVER_PORT</td>
    <td>
        Number
    </td>
    <td>
        <i>Optional in <code>polling</code> mode.</i> Specifies the server port. <br/>
        Defaults to <code>80</code>.
    </td>
  </tr>
  <tr>
    <td>BOT_ALLOWED_UPDATES</td>
    <td>
        Array of String
    </td>
    <td>
        <i>Optional.</i> A JSON-serialized list of the update types you want your bot to receive. See <a href="https://core.telegram.org/bots/api#update">Update</a> for a complete list of available update types. <br/>
        Defaults to an empty array (all update types except <code>chat_member</code>, <code>message_reaction</code> and <code>message_reaction_count</code>).
    </td>
  </tr>
  <tr>
    <td>BOT_ADMINS</td>
    <td>
        Array of Number
    </td>
    <td>
        <i>Optional.</i>
        Administrator user IDs.
        Use this to specify user IDs that have special privileges, such as executing <code>/setcommands</code>. <br/>
        Defaults to an empty array.
    </td>
  </tr>
</tbody>
</table>
