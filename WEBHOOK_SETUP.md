# Stripe Webhook Setup Guide

## Database Schema

Run the SQL in `database-schema.sql` to create the required tables:

1. **transactions** - Stores all Stripe payment transactions
2. **credit_usage** - Tracks credit consumption

## Supabase Edge Function Setup

### 1. Deploy the Function

```bash
# Navigate to your project root
cd /path/to/telegram-bot

# Deploy the function
supabase functions deploy stripe-webhook
```

### 2. Set Environment Variables

```bash
# Stripe API key (from Stripe Dashboard)
supabase secrets set STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing

# Stripe webhook signing secret (from Stripe Dashboard → Webhooks)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Telegram bot token
supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `<your-project-ref>` with your Supabase project reference.
4. Select event: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Set it as `STRIPE_WEBHOOK_SECRET` secret (step 2 above)

### 4. Test the Webhook

You can test the webhook using Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local function (for testing)
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger a test event
stripe trigger checkout.session.completed
```

## How It Works

1. **User purchases credits** → Bot creates Stripe checkout session
2. **User completes payment** → Stripe sends webhook event
3. **Edge Function receives event** → Verifies signature
4. **Function processes payment**:
   - Finds user by Stripe customer ID
   - Creates/updates transaction record
   - Adds credits to user account
   - Sends Telegram notification

## Database Tables

### transactions
- `id` - Primary key
- `user_id` - Foreign key to users table
- `stripe_session_id` - Stripe checkout session ID
- `stripe_payment_intent_id` - Stripe payment intent ID
- `amount` - Payment amount in cents
- `currency` - Currency code (e.g., 'hkd')
- `credits` - Number of credits purchased
- `status` - Transaction status (pending, completed, failed, cancelled)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### credit_usage
- `id` - Primary key
- `user_id` - Foreign key to users table
- `essay_upload_id` - Foreign key to essay_uploads (nullable)
- `credits_used` - Number of credits consumed
- `description` - Description of usage
- `created_at` - Creation timestamp

## Monitoring

Check function logs:
```bash
supabase functions logs stripe-webhook
```

## Troubleshooting

### Webhook not receiving events
- Verify webhook URL is correct
- Check Stripe webhook is enabled
- Verify webhook secret matches

### Credits not added
- Check function logs for errors
- Verify user has `customer_id` set
- Check transaction was created successfully

### Telegram message not sent
- Verify `TELEGRAM_BOT_TOKEN` is set correctly
- Check bot has permission to send messages
- Function will still succeed even if Telegram fails
