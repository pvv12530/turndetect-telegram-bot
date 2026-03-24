## Commands

start =
    .description = 啟動機器人
language =
    .description = 更改語言
setcommands =
    .description = 設置機器人命令

## Welcome Feature

welcome =
    📝 歡迎使用 EssayLab_Bot 論文分析器！

    使用 Turnitin/Originality 技術檢查您的論文是否存在抄襲以及人工智能問題。

    ✨ 我們提供：

    📊 Ai 檢查報告
    📈 抄襲報告
    🔍 會Highlight 有用AI/抄襲的部分
    📋 支援格式：docx.  (Microsoft word file)

    1. Turnitin 報告檢查  
    -採用最新 Turnitin 系統，提供抄襲相率檢查與 AI 檢測報告
    -每天定時檢查: 15:00/18:00/21:00/23:59 
    -有時會不定時檢查 [如果檢查量過多，我們會提早為同學檢查]


    2. Originality AI
    -這系統比Turnitin系統更嚴緊，出Report 時間較快，合適於用AI寫文章，想不斷減AI的同學使用]

    3. 想有人幫手減Ai/ 代做功課服務
    請聯絡 @Prof_writerchannel

    🚀 使用方法：

    1️⃣ 上傳您的論文
    2️⃣ 等待 30 分鐘左右
    3️⃣ 接收您的報告

    👇 準備好了嗎？
    點擊「上傳論文」或直接發送您的檔案

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

ai-report-introduction = 
    📤 <b>請發送您的論文文檔</b>
    
    這系統比Turnitin更嚴格
    
    如果原創性為100%信心度，則turnitin = 0%
    
    這系統出的AI報告比Turnitin更準確、更快速 (如這報告沒問題 = Turnitin 沒問題)
    
    不會上載你的文章到系統.
    
    你只需修改黃色，橙色，紅色 Highlight 的段落/文字以降低AI%
    
    <b>積分扣除規則：</b>
    • 3000字 = 1積分
    • 3000-6001字 = 2積分
    • 如此類推...
    
    支持格式：.doc、.docx
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
    📄 .doc、.docx
    
    <b>檔案大小限制：</b>
    📦 最大 20MB
    
    <b>積分系統：</b>
    💳 1 積分 = 30 港幣
    • Turnitin：每份文檔 2 積分
    • Originality：根據文檔字數計算
    您可以從個人資料購買積分。
    
    <b>字數計算方式：</b>
    📝 字數以文檔中的總字數為準（與 Word 字數統計一致）。
    在 Word 中：審閱 → 字數統計，即可查看字數。
    
    <b>積分扣除規則（Originality）：</b>
    • 3000 字 = 1 積分
    • 3001–6000 字 = 2 積分
    • 6001–9000 字 = 3 積分
    • 如此類推…
    
    <b>處理時間：</b>
    ⏱️ 支付後 30 分鐘 - 3 小時
    
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
    
    使用積分上傳和分析您的論文。
    • Turnitin：每份文檔 2 積分
    • Originality：根據文檔字數計算

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
    1 積分 = 30 港幣
    • Turnitin：每份文檔 2 積分
    • Originality：根據文檔字數計算
    
    選擇您要購買的積分數量：

credit-button-buy-10 = 購買 10 積分 (270 港幣)
credit-button-buy-100 = 購買 100 積分 (2550 港幣)
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
    
    例如：50（1500 港幣）

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
    
    您的文檔已上傳，已扣除積分。您的論文正在處理中。

upload-success-button-profile = 👤 個人資料
upload-success-button-home = 🏠 首頁

upload-button-continue = ✅ 繼續
upload-button-cancel = ❌ 取消
upload-button-buy-credits = 💳 購買積分
upload-button-back-home = 🏠 返回首頁

upload-no-service-selected = 
    ⚠️ <b>請先選擇服務</b>
    
    請從下方菜單選擇服務：

upload-ai-report-format-error = 
    ❌ <b>AI 報告服務檔案格式錯誤</b>
    
    AI 報告服務僅接受 .doc 或 .docx 格式檔案。請上傳 .doc 或 .docx 檔案。

upload-docx-format-error = 
    ❌ <b>檔案格式錯誤</b>
    
    僅接受 DOCX 格式檔案。請上傳 .docx 檔案。

upload-service-not-available = 
    ❌ <b>服務不可用</b>
    
    請從主菜單選擇服務。

upload-ai-report-not-configured = 
    ❌ <b>AI 報告服務未配置</b>
    
    請聯繫客服。

## Originality Analysis Results

originality-analysis-completed = ✅ <b>分析完成！</b>
originality-analysis-file = 📄 <b>檔案：</b> { $fileName }
originality-analysis-word-count = 📝 <b>字數：</b> { $wordCount } 字
originality-analysis-results-title = 🤖 <b>AI 檢測結果：</b>
originality-analysis-ai-score =    • <b>AI 分數：</b> { $aiScore }%
originality-analysis-original-score =    • <b>原創分數：</b> { $originalScore }%
originality-analysis-confidence =    • <b>信心度：</b> { $confidence }%
originality-analysis-full-report = 🔗 <b>完整報告：</b> { $publicLink }
originality-analysis-credits-used = 💰 <b>已使用積分：</b> { $creditsUsed }
originality-analysis-remaining-credits = 💳 <b>剩餘積分：</b> { $remainingCredits }
originality-analysis-view-report = 🔗 查看完整報告

## Upload Error Messages

upload-analyzing-in-progress = 
    ⏳ <b>正在分析中</b>
    
    您目前正在分析文檔。請等待當前分析完成後再上傳另一個文檔。

upload-error-save-file = 
    ❌ <b>儲存檔案失敗</b>
    
    錯誤：{ $errorMessage }

upload-error-read-file = 
    ❌ <b>讀取檔案失敗</b>
    
    錯誤：{ $errorMessage }

upload-error-extract-text-empty = 
    ❌ <b>無法提取文字</b>
    
    無法從文檔中提取文字。請確保文檔包含可讀取的文字。

upload-error-extract-text = 
    ❌ <b>提取文字失敗</b>
    
    錯誤：{ $errorMessage }

upload-originality-confirmation = 
    📊 <b>文檔分析</b>
    
    📄 <b>檔案：</b> { $fileName }
    📝 <b>字數：</b> { $wordCount } 字
    
    💰 <b>所需積分：</b> { $requiredCredits }
    💳 <b>您的積分：</b> { $currentCredit }
    
    您有足夠的積分繼續。您想要繼續嗎？

upload-originality-insufficient-credits = 
    📊 <b>文檔分析</b>
    
    📄 <b>檔案：</b> { $fileName }
    📝 <b>字數：</b> { $wordCount } 字
    
    💰 <b>所需積分：</b> { $requiredCredits }
    💳 <b>您的積分：</b> { $currentCredit }
    
    ❌ 您沒有足夠的積分。請購買積分以繼續。

upload-originality-processing = ⏳ 正在使用 Originality.ai 處理您的文檔...

upload-error-processing-request = 
    ❌ <b>處理請求時出錯</b>
    
    請聯繫客服。

upload-error-not-found = 
    ❌ <b>找不到上傳</b>
    
    找不到您要查找的上傳。

upload-error-user-not-found = 
    ❌ <b>找不到用戶</b>
    
    找不到您的用戶帳戶。

upload-error-insufficient-credits-retry = 
    ❌ <b>積分不足</b>
    
    您不再有足夠的積分。請購買積分。

upload-error-download-storage = 
    ❌ <b>下載檔案失敗</b>
    
    無法從儲存空間下載檔案。

upload-error-unsupported-format = 
    ❌ <b>不支援的檔案格式</b>
    
    不支援此檔案格式。

upload-error-no-text-content = 
    ❌ <b>沒有文字內容</b>
    
    無法從文檔中提取文字內容。

upload-error-read-content = 
    ❌ <b>讀取文檔內容失敗</b>
    
    錯誤：{ $errorMessage }

upload-error-process-failed = 
    ❌ <b>處理文檔失敗</b>
    
    如果此問題持續存在，請聯繫客服。

upload-originality-cancelled = 
    ❌ <b>分析已取消</b>
    
    分析已被取消。

upload-error-payment-processing = 
    ❌ <b>處理支付時出錯</b>
    
    請聯繫客服。

## Welcome Feature Errors

welcome-service-not-found = 
    ❌ <b>找不到服務</b>
    
    找不到請求的服務。

welcome-service-stopped = 
    ⚠️ <b>服務暫時不可用</b>
    
    此服務目前暫時停止。

welcome-upload-prompt-docx = 
    📤 <b>請上傳您的論文文檔</b>
    
    僅支援 DOCX 格式。

welcome-error-occurred = 
    ❌ <b>發生錯誤</b>
    
    請重試。

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

## Course Request Feature

course-service-introduction =
    📚 <b>課程材料請求服務</b>
    
    我們很高興為您提供全面的課程材料和教育資源，以滿足您的學術需求。
    
    只需描述您需要什麼 - 無論是講義、學習指南、作業範例還是任何其他課程相關材料。我們會仔細審查您的請求，並為您提供最相關和優質的資源。
    
    💡 <b>請求中應包含的內容：</b>
    • 課程名稱或學科領域
    • 您需要的具體主題或章節
    • 您尋求的材料類型
    • 任何特定要求或偏好
    
    請回覆您的詳細請求，我們會記錄下來。一旦我們找到合適的材料，我們會直接在此回覆您。

course-request-empty =
    ⚠️ <b>請求為空</b>
    
    請提供您需要的課程材料的詳細信息。

course-request-confirmation =
    ✅ <b>請求已收到！</b>
    
    感謝您的課程材料請求。我們已仔細記錄了您提供的所有詳細信息。
    
    我們的團隊將審查您的請求，並在我們廣泛的數據庫中搜索最相關和優質的材料以滿足您的需求。我們會在8小時內直接在此回覆您，提供課程材料或更新您請求的狀態。
    
    您的請求現已在我們的隊列中，我們會盡快回覆您。同時，請完成付款以完成您的請求。

course-request-error =
    ❌ <b>創建課程請求失敗</b>
    
    請重試，如果問題持續存在，請聯繫客服。

course-request-payment-prompt =
    💳 <b>需要付款</b>
    
    為處理您的課程材料請求，請完成付款：
    
    <b>所需積分：</b> { $creditsRequired }
    <b>您當前的積分：</b> { $currentCredits }
    
    請使用下方按鈕繼續付款。

course-request-pay-with-credits-button = 💳 使用積分付款
course-request-buy-credits-button = 💰 購買積分

course-request-not-found =
    ❌ <b>找不到課程請求</b>
    
    找不到請求的課程請求。

course-request-already-paid =
    ✅ <b>付款已處理</b>
    
    此課程請求（ID：{ $requestId }）已經付款。我們會在8小時內回覆您的請求。

course-request-payment-success =
    ✅ <b>付款成功！</b>
    
    感謝您的付款。您的課程材料請求已成功處理。
    
    <b>請求ID：</b> { $requestId }
    
    我們會審查您的請求，並在8小時內直接在此回覆您，提供課程材料或更新您請求的狀態。請保留此請求ID以備記錄。

course-request-payment-error =
    ❌ <b>付款處理錯誤</b>
    
    處理您的付款時發生錯誤。如果您已被扣款，請聯繫客服。

course-request-payment-cancelled =
    ❌ <b>付款已取消</b>
    
    您的付款已被取消。您可以稍後重試付款以完成您的課程請求。

course-request-insufficient-credits =
    ⚠️ <b>積分不足</b>
    
    您沒有足夠的積分來完成此付款。請購買更多積分。

course-request-credits-added =
    ✅ <b>積分添加成功！</b>
    
    您的積分已添加到您的帳戶。您現在可以繼續您的課程請求付款。