/* ============================================
   GOOGLE APPS SCRIPT - Backend Handler
   Receives form submissions, sends emails,
   and saves data to Google Sheets
   ============================================ */

// Configuration
const RECIPIENT_EMAIL = 'karthiknaidu95@gmail.com';
const SHEET_NAME = 'Responses';

/**
 * Handle POST requests from the frontend
 */
function doPost(e) {
    try {
        // Parse the request payload
        const payload = JSON.parse(e.postData.contents);
        
        // Validate payload
        if (!payload || !payload.response) {
            return createJsonResponse(false, 'Invalid payload');
        }
        
        // Get or create the spreadsheet
        const sheet = getOrCreateSheet();
        
        // Add data to sheet
        addResponseToSheet(sheet, payload);
        
        // Send email notification
        sendEmailNotification(payload);
        
        // Return success response
        return createJsonResponse(true, 'Response recorded successfully');
        
    } catch (error) {
        console.error('Error in doPost:', error);
        return createJsonResponse(false, error.toString());
    }
}

/**
 * Get or create the response sheet
 */
function getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        addHeaderRow(sheet);
    }
    
    return sheet;
}

/**
 * Add header row to the sheet
 */
function addHeaderRow(sheet) {
    const headers = [
        'Timestamp',
        'Response',
        'Meal',
        'Date',
        'Time',
        'Browser',
        'Device',
        'Submitted On',
        'IP Address'
    ];
    
    sheet.appendRow(headers);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#ff6b9d');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
}

/**
 * Add response to sheet
 */
function addResponseToSheet(sheet, payload) {
    const row = [
        new Date(),
        payload.response.toUpperCase(),
        payload.meal ? payload.meal.charAt(0).toUpperCase() + payload.meal.slice(1) : '',
        payload.date || '',
        payload.time || '',
        payload.browser || '',
        payload.device || '',
        payload.submittedOn || new Date().toISOString(),
        getClientIpAddress()
    ];
    
    sheet.appendRow(row);
    
    // Auto-resize columns
    for (let i = 1; i <= row.length; i++) {
        sheet.autoResizeColumn(i);
    }
    
    // Format the data
    formatResponseRow(sheet, sheet.getLastRow());
}

/**
 * Format response row based on response type
 */
function formatResponseRow(sheet, rowNumber) {
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    const responseValue = sheet.getRange(rowNumber, 2).getValue();
    
    if (responseValue === 'YES') {
        range.setBackground('#e8f5e9');
        sheet.getRange(rowNumber, 2).setFontColor('#2e7d32');
    } else if (responseValue === 'NO') {
        range.setBackground('#fff3e0');
        sheet.getRange(rowNumber, 2).setFontColor('#e65100');
    }
}

/**
 * Send email notification
 */
function sendEmailNotification(payload) {
    try {
        const emailSubject = '🍽️ New Lunch/Dinner Invitation Response';
        
        const emailBody = createEmailBody(payload);
        
        MailApp.sendEmail(
            RECIPIENT_EMAIL,
            emailSubject,
            emailBody,
            {
                htmlBody: createHtmlEmailBody(payload)
            }
        );
        
        console.log('✅ Email sent successfully to ' + RECIPIENT_EMAIL);
        
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

/**
 * Create plain text email body
 */
function createEmailBody(payload) {
    const responseText = payload.response.toUpperCase() === 'YES' ? 'ACCEPTED ✓' : 'DECLINED';
    const mealText = payload.meal ? payload.meal.charAt(0).toUpperCase() + payload.meal.slice(1) : 'N/A';
    const dateText = formatDate(payload.date);
    const timeText = formatTime(payload.time);
    
    let body = `New Lunch/Dinner Invitation Response\n`;
    body += `=====================================\n\n`;
    body += `Response: ${responseText}\n`;
    body += `Meal: ${mealText}\n`;
    body += `Date: ${dateText}\n`;
    body += `Time: ${timeText}\n`;
    body += `Browser: ${payload.browser || 'Unknown'}\n`;
    body += `Device: ${payload.device || 'Unknown'}\n`;
    body += `Submitted: ${formatDateTime(payload.submittedOn)}\n`;
    body += `IP Address: ${getClientIpAddress()}\n`;
    
    return body;
}

/**
 * Create HTML email body with beautiful styling
 */
function createHtmlEmailBody(payload) {
    const responseText = payload.response.toUpperCase() === 'YES' ? '✓ ACCEPTED' : '✗ DECLINED';
    const responseColor = payload.response.toUpperCase() === 'YES' ? '#4CAF50' : '#ff6b6b';
    const mealEmoji = payload.meal === 'lunch' ? '🍱' : '🍽️';
    const mealText = payload.meal ? payload.meal.charAt(0).toUpperCase() + payload.meal.slice(1) : 'N/A';
    const dateText = formatDate(payload.date);
    const timeText = formatTime(payload.time);
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; padding: 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #ff6b9d 0%, #ffa502 100%); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
                .content { padding: 30px 20px; }
                .response-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${responseColor}; }
                .response-badge {
                    display: inline-block;
                    background-color: ${responseColor};
                    color: white;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: bold;
                    font-size: 18px;
                    margin-bottom: 15px;
                }
                .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .detail-item { background: #f0f0f0; padding: 12px; border-radius: 6px; }
                .detail-label { font-weight: bold; color: #ff6b9d; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
                .detail-value { color: #333; font-size: 16px; }
                .divider { height: 1px; background: #eee; margin: 20px 0; }
                .info-box { background: #f9f9f9; padding: 12px; border-radius: 6px; margin-top: 15px; font-size: 13px; color: #666; border-left: 3px solid #ffa502; }
                .footer { background: #f5f5f5; padding: 15px 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
                .icon { font-size: 14px; margin-right: 6px; }
                a { color: #ff6b9d; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>🍽️ Lunch/Dinner Invitation</h1>
                    <p>New Response Received</p>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <!-- Response Status -->
                    <div class="response-section">
                        <div class="response-badge">${responseText}</div>
                        <p style="margin: 0; color: #666;">New invitation response from your website</p>
                    </div>
                    
                    <!-- Details Grid -->
                    <div class="details">
                        <div class="detail-item">
                            <div class="detail-label"><span class="icon">${mealEmoji}</span>Meal Type</div>
                            <div class="detail-value">${mealText}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label"><span class="icon">📅</span>Date</div>
                            <div class="detail-value">${dateText}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label"><span class="icon">⏰</span>Time</div>
                            <div class="detail-value">${timeText}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label"><span class="icon">💻</span>Device</div>
                            <div class="detail-value">${payload.device || 'Unknown'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label"><span class="icon">🌐</span>Browser</div>
                            <div class="detail-value">${payload.browser || 'Unknown'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label"><span class="icon">⏱️</span>Submitted</div>
                            <div class="detail-value">${formatDateTime(payload.submittedOn)}</div>
                        </div>
                    </div>
                    
                    <!-- Info Box -->
                    <div class="info-box">
                        <strong>💡 Tip:</strong> All responses are automatically saved to your Google Sheet. Check there for a complete overview of all responses.
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p style="margin: 0;">This email was automatically generated by your Lunch/Dinner Invitation website.</p>
                    <p style="margin: 8px 0 0 0;"><a href="https://sheets.google.com">📊 View all responses in Google Sheets</a></p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return html;
}

/**
 * Get client IP address
 */
function getClientIpAddress() {
    // This is a placeholder. Google Apps Script doesn't directly provide client IP in doPost.
    // You can implement more sophisticated detection if needed.
    return 'Not available';
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return Utilities.formatDate(date, Session.getScriptTimeZone(), 'EEEE, MMMM d, yyyy');
    } catch (e) {
        return dateString;
    }
}

/**
 * Format time string
 */
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
        return timeString;
    }
}

/**
 * Format date and time
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return new Date().toLocaleString();
    
    try {
        const date = new Date(dateTimeString);
        return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM/dd/yyyy hh:mm:ss a');
    } catch (e) {
        return dateTimeString;
    }
}

/**
 * Create JSON response
 */
function createJsonResponse(success, message) {
    return ContentService.createTextOutput(
        JSON.stringify({
            success: success,
            message: message,
            timestamp: new Date().toISOString()
        })
    ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify setup
 */
function testSetup() {
    const testPayload = {
        response: 'yes',
        date: '2026-08-15',
        time: '19:00',
        meal: 'dinner',
        browser: 'Chrome',
        device: 'Desktop',
        submittedOn: new Date().toISOString()
    };
    
    try {
        Logger.log('🔄 Testing setup...');
        const sheet = getOrCreateSheet();
        Logger.log('✅ Google Sheet connected');
        
        addResponseToSheet(sheet, testPayload);
        Logger.log('✅ Test response added to sheet');
        
        sendEmailNotification(testPayload);
        Logger.log('✅ Test email sent');
        Logger.log('📧 Check your email (karthiknaidu95@gmail.com) for the test message!');
        Logger.log('📊 Check your Google Sheet for the new row!');
        
    } catch (error) {
        Logger.log('❌ Test failed: ' + error);
    }
}
