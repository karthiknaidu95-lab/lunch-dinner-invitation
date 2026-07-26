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
        const emailSubject = 'New Lunch/Dinner Invitation Response';
        
        const emailBody = createEmailBody(payload);
        
        MailApp.sendEmail(
            RECIPIENT_EMAIL,
            emailSubject,
            emailBody,
            {
                htmlBody: createHtmlEmailBody(payload)
            }
        );
        
        console.log('Email sent successfully to ' + RECIPIENT_EMAIL);
        
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
 * Create HTML email body
 */
function createHtmlEmailBody(payload) {
    const responseText = payload.response.toUpperCase() === 'YES' ? '✓ ACCEPTED' : '✗ DECLINED';
    const responseColor = payload.response.toUpperCase() === 'YES' ? '#4CAF50' : '#ff6b6b';
    const mealText = payload.meal ? payload.meal.charAt(0).toUpperCase() + payload.meal.slice(1) : 'N/A';
    const dateText = formatDate(payload.date);
    const timeText = formatTime(payload.time);
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b9d, #ffa502); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b9d; }
                .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .row:last-child { border-bottom: none; }
                .label { font-weight: bold; color: #666; }
                .value { color: #333; }
                .response-badge {
                    display: inline-block;
                    background-color: ${responseColor};
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 16px;
                }
                .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍽️ Lunch/Dinner Invitation Response</h1>
                </div>
                
                <div class="content">
                    <div class="row">
                        <span class="label">Response:</span>
                        <span class="response-badge">${responseText}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Meal Type:</span>
                        <span class="value">${mealText}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Date:</span>
                        <span class="value">${dateText}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Time:</span>
                        <span class="value">${timeText}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Browser:</span>
                        <span class="value">${payload.browser || 'Unknown'}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Device:</span>
                        <span class="value">${payload.device || 'Unknown'}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Submitted:</span>
                        <span class="value">${formatDateTime(payload.submittedOn)}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">IP Address:</span>
                        <span class="value">${getClientIpAddress()}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This email was sent from the Lunch/Dinner Invitation website.</p>
                    <p>Timestamp: ${new Date().toLocaleString()}</p>
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
        const sheet = getOrCreateSheet();
        addResponseToSheet(sheet, testPayload);
        sendEmailNotification(testPayload);
        Logger.log('Test completed successfully!');
    } catch (error) {
        Logger.log('Test failed: ' + error);
    }
}