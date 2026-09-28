/**
 * Paste into Google Apps Script bound to the spreadsheet.
 * Deploy as web app: Execute as Me, Who has access: Anyone.
 *
 * Tab name: leads (or Leads)
 * Header row must match LEADS_TAB_HEADERS in api/submit-application/sheetLead.ts
 */
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    ss.getSheetByName('leads') ||
    ss.getSheetByName('Leads');
  if (!sheet) {
    throw new Error('Missing sheet tab named "leads"');
  }

  const data = JSON.parse(e.postData.contents);
  const values = data.values;
  if (!Array.isArray(values)) {
    throw new Error('Expected JSON { values: [...] }');
  }

  sheet.appendRow(values);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doGet() {
  return ContentService.createTextOutput('ok');
}
