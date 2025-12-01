## Commands

start =
    .description = Start the bot
language =
    .description = Change language
setcommands =
    .description = Set bot commands

## Welcome Feature

welcome =
    📝 <b>Welcome to Turnitin Pro Essay Analyzer!</b>
    
    Check your essays for plagiarism using Turnitin's technology trusted by 16,000+ institutions worldwide.
    
    ✨ <b>What We Offer:</b>
    
    📊 Plagiarism detection against billions of sources
    📈 Detailed similarity reports with matched sources
    🔍 Citation analysis
    📋 Multiple formats: .doc, .docx
    
    🚀 <b>How It Works:</b>
    
    1️⃣ Upload your essay
    2️⃣ Wait 5-10 minutes for analysis
    3️⃣ Receive your report
    
    👇 <b>Ready?</b>
    Click "Upload Essay" or send your file directly!

welcome-button-upload = 📤 Upload Essay
welcome-button-profile = 👤 Profile
welcome-button-language = 🌐 Language
welcome-button-feedback = 💬 Feedback
welcome-button-help = ❓ Help

## Language Feature

language-select = Please, select your language
language-changed = Language successfully changed!

## Admin Feature

admin-commands-updated = Commands updated.

## Upload Feature

ai-report-introduction = 
    📤 <b>Please send your essay document</b>
    
    This AI report is stricter, more accurate, and faster than Turnitin (if this report shows no issues, Turnitin will definitely be fine)
    
    Your essay will NOT be uploaded to any external database
    
    You only need to revise the parts highlighted in yellow, orange, or red
    
    Supported formats: .doc, .docx
    Maximum size: 20MB

upload-processing = ⏳ Processing your document...

upload-success =
    ✅ <b>Essay uploaded successfully!</b>

    📄 <b>File Name:</b> { $fileName }
    📦 <b>File Size:</b> { $fileSize }
    🆔 <b>Upload ID:</b> #{ $uploadId }

    💡 Please proceed with payment to start the analysis.

upload-success-payment =
    ✅ <b>Essay uploaded successfully!</b>

    📄 <b>File Name:</b> { $fileName }
    📦 <b>File Size:</b> { $fileSize }
    🆔 <b>Upload ID:</b> #{ $uploadId }

    💰 <b>Price:</b> { $price } { $currency }

    Click the "Pay Now" button below to proceed with secure Stripe payment.
    After payment, you'll receive instant access to your file and analysis report.

payment-processing =
    ⏳ <b>Processing your payment...</b>

    Upload ID: #{ $uploadId }

    Please wait while we confirm your payment. You'll receive a notification once it's complete.

payment-cancelled =
    ❌ <b>Payment cancelled</b>

    Upload ID: #{ $uploadId }

    Your payment was cancelled. You can still access your upload and try again whenever you're ready.

upload-error = 
    ❌ <b>Upload failed</b>
    
    Please try again or contact support if the problem persists.

user-not-found = 
    ⚠️ <b>User session not found</b>
    
    Please use /start to initialize your session.

## Help Feature

help-message =
    ❓ <b>How to Use Turnitin Pro Essay Analyzer</b>
    
    <b>Step 1: Upload Your Essay</b>
    Click "📤 Upload Essay" and send your document file.
    
    <b>Step 2: Make Payment</b>
    After upload, you'll receive a payment link. Click "💳 Pay Now" to proceed.
    
    <b>Step 3: Get Your Report</b>
    Once payment is confirmed, you'll receive:
    • Download link to your file
    • Plagiarism analysis report
    • Detailed similarity breakdown
    
    <b>Supported Formats:</b>
    📄 .doc, .docx
    
    <b>File Size Limit:</b>
    📦 Maximum 20MB
    
    <b>Credits System:</b>
    💳 1 credit = 1 doc check = 20 HKD
    Each document upload and analysis costs 1 credit. You can purchase credits from your profile.
    
    <b>Processing Time:</b>
    ⏱️ 5-10 minutes after payment
    
    <b>Need Support?</b>
    Contact us if you have any questions!
    
    📧 <b>Email:</b>
    ronald@studyhardprofessor.com
    
    💬 <b>WhatsApp:</b>
    wa.me/85261994783

## Unhandled Feature

unhandled = Unrecognized command. Try /start

## Profile Feature

profile-message =
    👤 <b>Your Profile</b>
    
    💳 <b>Remaining Credits:</b> { $credit }
    
    Use credits to upload and analyze your essays. Each upload costs 1 credit.

profile-button-buy-credit = 💰 Buy Credits
profile-button-back-home = 🏠 Back to Home

profile-error = 
    ❌ <b>Failed to load profile</b>
    
    Please try again or contact support.

profile-error-customer = 
    ⚠️ <b>Account Setup Required</b>
    
    Your account is being set up. Please try again in a moment or contact support.

## Credit Purchase Feature

credit-purchase-message =
    💰 <b>Buy Credits</b>
    
    💳 <b>Current Credits:</b> { $currentCredit }
    💵 <b>Price:</b> { $pricePerCredit } HKD per credit
    
    📝 <b>About Credits:</b>
    1 credit = 1 doc check = 20 HKD
    
    Choose how many credits you want to purchase:

credit-button-buy-10 = Buy 10 (200 HKD)
credit-button-buy-100 = Buy 100 (2000 HKD)
credit-button-buy-custom = Buy Custom Amount
credit-button-pay-now = 💳 Pay Now
credit-button-back-profile = ← Back to Profile

credit-purchase-checkout =
    💳 <b>Payment Checkout</b>
    
    📦 <b>Credits:</b> { $credits }
    💵 <b>Amount:</b> { $amount } HKD
    
    Click the button below to complete your payment securely via Stripe.

credit-purchase-success =
    ✅ <b>Payment Processing</b>
    
    Your credit purchase is being processed. You'll receive a confirmation message once the payment is complete.

credit-purchase-cancelled =
    ❌ <b>Payment Cancelled</b>
    
    Your credit purchase was cancelled. You can try again whenever you're ready.

credit-purchase-custom-prompt =
    💰 <b>Custom Credit Purchase</b>
    
    Please enter the number of credits you want to purchase (minimum 1):
    
    Example: 50 (for 1000 HKD)

credit-purchase-invalid-amount =
    ❌ <b>Invalid Amount</b>
    
    Please enter a valid number greater than 0.

credit-purchase-error =
    ❌ <b>Failed to process credit purchase</b>
    
    Please try again or contact support.

## Upload Feature Updates

upload-insufficient-credit =
    ⚠️ <b>Insufficient Credits</b>
    
    You currently have { $currentCredit } credits, but you need { $requiredCredit } credit(s) to upload a document.
    
    Please purchase more credits to continue.

upload-insufficient-credit-button = 💰 Buy Credits
upload-insufficient-credit-button-home = 🏠 Back to Home

upload-success-credit =
    ✅ <b>Essay uploaded successfully!</b>
    
    📄 <b>File Name:</b> { $fileName }
    📦 <b>File Size:</b> { $fileSize }
    🆔 <b>Upload ID:</b> #{ $uploadId }
    💳 <b>Remaining Credits:</b> { $remainingCredit }
    
    Your document has been uploaded and 1 credit has been deducted. Your essay is now being processed.

upload-success-button-profile = 👤 Profile
upload-success-button-home = 🏠 Home

upload-button-continue = ✅ Continue
upload-button-cancel = ❌ Cancel
upload-button-buy-credits = 💳 Buy Credits
upload-button-back-home = 🏠 Back to Home

upload-no-service-selected = 
    ⚠️ <b>Please select a service first</b>
    
    Please select a service from the menu below:

upload-ai-report-format-error = 
    ❌ <b>Invalid file format for AI report service</b>
    
    Only .doc or .docx format files are accepted for AI report service. Please upload a .doc or .docx file.

upload-docx-format-error = 
    ❌ <b>Invalid file format</b>
    
    Only DOCX format files are accepted. Please upload a .docx file.

upload-service-not-available = 
    ❌ <b>Service not available</b>
    
    Please select a service from the main menu.

upload-ai-report-not-configured = 
    ❌ <b>AI report service is not configured</b>
    
    Please contact support.

## Originality Analysis Results

originality-analysis-completed = ✅ <b>Analysis Completed!</b>
originality-analysis-file = 📄 <b>File:</b> { $fileName }
originality-analysis-word-count = 📝 <b>Word Count:</b> { $wordCount } words
originality-analysis-results-title = 🤖 <b>AI Detection Results:</b>
originality-analysis-ai-score =    • <b>AI Score:</b> { $aiScore }%
originality-analysis-original-score =    • <b>Original Score:</b> { $originalScore }%
originality-analysis-confidence =    • <b>Confidence:</b> { $confidence }%
originality-analysis-full-report = 🔗 <b>Full Report:</b> { $publicLink }
originality-analysis-credits-used = 💰 <b>Credits Used:</b> { $creditsUsed }
originality-analysis-remaining-credits = 💳 <b>Remaining Credits:</b> { $remainingCredits }
originality-analysis-view-report = 🔗 View Full Report

## Upload Error Messages

upload-analyzing-in-progress = 
    ⏳ <b>Analysis in Progress</b>
    
    You are currently analyzing a document. Please wait for the current analysis to complete before uploading another document.

upload-error-save-file = 
    ❌ <b>Failed to save file</b>
    
    Error: { $errorMessage }

upload-error-read-file = 
    ❌ <b>Failed to read file</b>
    
    Error: { $errorMessage }

upload-error-extract-text-empty = 
    ❌ <b>Unable to extract text</b>
    
    Unable to extract text from document. Please ensure the document contains readable text.

upload-error-extract-text = 
    ❌ <b>Failed to extract text</b>
    
    Error: { $errorMessage }

upload-originality-confirmation = 
    📊 <b>Document Analysis</b>
    
    📄 <b>File:</b> { $fileName }
    📝 <b>Word Count:</b> { $wordCount } words
    
    💰 <b>Required Credits:</b> { $requiredCredits }
    💳 <b>Your Credits:</b> { $currentCredit }
    
    You have enough credits to proceed. Would you like to continue?

upload-originality-insufficient-credits = 
    📊 <b>Document Analysis</b>
    
    📄 <b>File:</b> { $fileName }
    📝 <b>Word Count:</b> { $wordCount } words
    
    💰 <b>Required Credits:</b> { $requiredCredits }
    💳 <b>Your Credits:</b> { $currentCredit }
    
    ❌ You don't have enough credits. Please purchase credits to continue.

upload-originality-processing = ⏳ Processing your document with Originality.ai...

upload-error-processing-request = 
    ❌ <b>Error processing request</b>
    
    Please contact support.

upload-error-not-found = 
    ❌ <b>Upload not found</b>
    
    The upload you're looking for could not be found.

upload-error-user-not-found = 
    ❌ <b>User not found</b>
    
    Your user account could not be found.

upload-error-insufficient-credits-retry = 
    ❌ <b>Insufficient Credits</b>
    
    You no longer have enough credits. Please purchase credits.

upload-error-download-storage = 
    ❌ <b>Failed to download file</b>
    
    Failed to download file from storage.

upload-error-unsupported-format = 
    ❌ <b>Unsupported file format</b>
    
    The file format is not supported.

upload-error-no-text-content = 
    ❌ <b>No text content</b>
    
    No text content extracted from document.

upload-error-read-content = 
    ❌ <b>Failed to read document content</b>
    
    Error: { $errorMessage }

upload-error-process-failed = 
    ❌ <b>Failed to process your document</b>
    
    Please contact support if this issue persists.

upload-originality-cancelled = 
    ❌ <b>Analysis cancelled</b>
    
    The analysis has been cancelled.

upload-error-payment-processing = 
    ❌ <b>Error processing payment</b>
    
    Please contact support.

## Welcome Feature Errors

welcome-service-not-found = 
    ❌ <b>Service not found</b>
    
    The requested service could not be found.

welcome-service-stopped = 
    ⚠️ <b>Service temporarily unavailable</b>
    
    This service is currently stopped for now.

welcome-upload-prompt-docx = 
    📤 <b>Please upload your essay document</b>
    
    DOCX format only.

welcome-error-occurred = 
    ❌ <b>An error occurred</b>
    
    Please try again.

## Feedback Feature

feedback-prompt =
    💬 <b>We'd love to hear your feedback!</b>
    
    How would you rate your experience with our service?
    
    Please select one of the options below:

feedback-button-good = 👍 Good
feedback-button-bad = 👎 Bad
feedback-button-exit = ← Exit
feedback-button-skip = ⏭️ Skip

feedback-message-prompt =
    💬 <b>Thank you for your feedback!</b>
    
    Would you like to leave a message to help us improve?
    
    You can type your feedback below or click "Skip" to continue.

feedback-thank-you =
    ✅ <b>Thank you for your feedback!</b>
    
    We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve our service.

feedback-error =
    ❌ <b>Failed to save feedback</b>
    
    Please try again or contact support if the problem persists.
