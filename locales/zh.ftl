## Commands

start =
    .description = 啟動機器人
language =
    .description = 更改語言
setcommands =
    .description = 設置機器人命令

## Welcome Feature

welcome =
    📝 <b>歡迎使用 Turnitin Pro 論文分析器！</b>
    
    使用全球 16,000+ 機構信賴的 Turnitin 技術檢查您的論文是否存在抄襲。
    
    ✨ <b>我們提供：</b>
    
    📊 針對數十億來源的抄襲檢測
    📈 詳細的相似度報告及匹配來源
    🔍 引用分析
    📋 支持多種格式：.doc、.docx、.pdf、.txt
    
    🚀 <b>使用方法：</b>
    
    1️⃣ 上傳您的論文
    2️⃣ 等待 5-10 分鐘進行分析
    3️⃣ 接收您的報告
    
    👇 <b>準備好了嗎？</b>
    點擊「上傳論文」或直接發送您的檔案！

welcome-button-upload = 📤 上傳論文
welcome-button-profile = 👤 個人資料
welcome-button-language = 🌐 語言
welcome-button-feedback = 💬 意見回饋
welcome-button-help = ❓ 幫助

## Language Feature

language-select = 請選擇您的語言
language-changed = 語言切換成功！

## Admin Feature

admin-commands-updated = 命令已更新。

## Upload Feature

upload-prompt = 
    📤 <b>請發送您的論文文檔</b>
    
    支持格式：.doc、.docx、.pdf、.txt
    最大大小：20MB

upload-processing = ⏳ 正在處理您的文檔...

upload-success =
    ✅ <b>論文上傳成功！</b>

    📄 <b>檔案名稱：</b> { $fileName }
    📦 <b>檔案大小：</b> { $fileSize }
    🆔 <b>上傳 ID：</b> #{ $uploadId }

    💡 請繼續支付以開始分析。

upload-success-payment =
    ✅ <b>論文上傳成功！</b>

    📄 <b>檔案名稱：</b> { $fileName }
    📦 <b>檔案大小：</b> { $fileSize }
    🆔 <b>上傳 ID：</b> #{ $uploadId }

    💰 <b>價格：</b> { $price } { $currency }

    點擊下方「立即支付」按鈕，通過 Stripe 安全支付。
    支付完成後，您將立即獲得檔案訪問權限和分析報告。

payment-processing =
    ⏳ <b>正在處理您的支付...</b>

    上傳 ID：#{ $uploadId }

    請稍候，我們正在確認您的支付。完成後您將收到通知。

payment-cancelled =
    ❌ <b>支付已取消</b>

    上傳 ID：#{ $uploadId }

    您的支付已取消。您仍然可以訪問您的上傳，並隨時重試。

upload-error = 
    ❌ <b>上傳失敗</b>
    
    請重試，如果問題持續存在，請聯繫客服。

user-not-found = 
    ⚠️ <b>未找到用戶會話</b>
    
    請使用 /start 初始化您的會話。

## Help Feature

help-message =
    ❓ <b>如何使用 Turnitin Pro 論文分析器</b>
    
    <b>步驟 1：上傳您的論文</b>
    點擊「📤 上傳論文」並發送您的文檔檔案。
    
    <b>步驟 2：完成支付</b>
    上傳後，您將收到支付連結。點擊「💳 立即支付」繼續。
    
    <b>步驟 3：獲取您的報告</b>
    支付確認後，您將收到：
    • 檔案下載連結
    • 抄襲分析報告
    • 詳細的相似度分析
    
    <b>支持格式：</b>
    📄 .doc、.docx、.pdf、.txt
    
    <b>檔案大小限制：</b>
    📦 最大 20MB
    
    <b>積分系統：</b>
    💳 1 積分 = 1 次文檔檢查 = 20 港幣
    每次文檔上傳和分析需要 1 積分。您可以從個人資料購買積分。
    
    <b>處理時間：</b>
    ⏱️ 支付後 5-10 分鐘
    
    <b>需要支持？</b>
    如有任何問題，請聯繫我們！
    
    📧 <b>電子郵件：</b>
    ronald@studyhardprofessor.com
    
    💬 <b>WhatsApp：</b>
    wa.me/85261994783

## Unhandled Feature

unhandled = 無法識別的命令。請嘗試 /start

## Profile Feature

profile-message =
    👤 <b>您的個人資料</b>
    
    💳 <b>剩餘積分：</b> { $credit }
    
    使用積分上傳和分析您的論文。每次上傳需要 1 積分。

profile-button-buy-credit = 💰 購買積分
profile-button-back-home = 🏠 返回首頁

profile-error = 
    ❌ <b>載入個人資料失敗</b>
    
    請重試或聯繫客服。

profile-error-customer = 
    ⚠️ <b>需要設置帳戶</b>
    
    您的帳戶正在設置中。請稍後再試或聯繫客服。

## Credit Purchase Feature

credit-purchase-message =
    💰 <b>購買積分</b>
    
    💳 <b>當前積分：</b> { $currentCredit }
    💵 <b>價格：</b> { $pricePerCredit } 港幣/積分
    
    📝 <b>關於積分：</b>
    1 積分 = 1 次文檔檢查 = 20 港幣
    
    選擇您要購買的積分數量：

credit-button-buy-10 = 購買 10 積分 (200 港幣)
credit-button-buy-100 = 購買 100 積分 (2000 港幣)
credit-button-buy-custom = 自定義數量
credit-button-pay-now = 💳 立即支付
credit-button-back-profile = ← 返回個人資料

credit-purchase-checkout =
    💳 <b>支付結帳</b>
    
    📦 <b>積分：</b> { $credits }
    💵 <b>金額：</b> { $amount } 港幣
    
    點擊下方按鈕，通過 Stripe 安全完成支付。

credit-purchase-success =
    ✅ <b>正在處理支付</b>
    
    您的積分購買正在處理中。支付完成後，您將收到確認消息。

credit-purchase-cancelled =
    ❌ <b>支付已取消</b>
    
    您的積分購買已取消。您可以隨時重試。

credit-purchase-custom-prompt =
    💰 <b>自定義積分購買</b>
    
    請輸入您要購買的積分數量（最少 1）：
    
    例如：50（1000 港幣）

credit-purchase-invalid-amount =
    ❌ <b>無效金額</b>
    
    請輸入大於 0 的有效數字。

credit-purchase-error =
    ❌ <b>處理積分購買失敗</b>
    
    請重試或聯繫客服。

## Upload Feature Updates

upload-insufficient-credit =
    ⚠️ <b>積分不足</b>
    
    您目前有 { $currentCredit } 積分，但上傳文檔需要 { $requiredCredit } 積分。
    
    請購買更多積分以繼續。

upload-insufficient-credit-button = 💰 購買積分
upload-insufficient-credit-button-home = 🏠 返回首頁

upload-success-credit =
    ✅ <b>論文上傳成功！</b>
    
    📄 <b>檔案名稱：</b> { $fileName }
    📦 <b>檔案大小：</b> { $fileSize }
    🆔 <b>上傳 ID：</b> #{ $uploadId }
    💳 <b>剩餘積分：</b> { $remainingCredit }
    
    您的文檔已上傳，已扣除 1 積分。您的論文正在處理中。

upload-success-button-profile = 👤 個人資料
upload-success-button-home = 🏠 首頁

## Feedback Feature

feedback-prompt =
    💬 <b>我們很樂意聽到您的意見回饋！</b>
    
    您如何評價使用我們服務的體驗？
    
    請選擇以下選項之一：

feedback-button-good = 👍 很好
feedback-button-bad = 👎 不好
feedback-button-exit = ← 退出
feedback-button-skip = ⏭️ 跳過

feedback-message-prompt =
    💬 <b>感謝您的意見回饋！</b>
    
    您想要留下一些訊息幫助我們改進嗎？
    
    您可以在下方輸入您的意見，或點擊「跳過」繼續。

feedback-thank-you =
    ✅ <b>感謝您的意見回饋！</b>
    
    我們感謝您花時間與我們分享您的想法。您的意見回饋有助於我們改進服務。

feedback-error =
    ❌ <b>儲存意見回饋失敗</b>
    
    請重試，如果問題持續存在，請聯繫客服。

