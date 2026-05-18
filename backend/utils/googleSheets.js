// import { google } from 'googleapis';

// const auth = new google.auth.GoogleAuth({
//   keyFile: 'path/to/service-account-key.json', // download from Google Cloud
//   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });

// const sheets = google.sheets({ version: 'v4', auth });

// export const appendToSheet = async (leadData) => {
//   const spreadsheetId = process.env.GOOGLE_SHEET_ID;
//   const range = 'Leads!A:F'; // adjust columns

//   const values = [[
//     leadData.name,
//     leadData.email,
//     leadData.phone,
//     leadData.propertySlug || '',
//     leadData.source,
//     new Date().toISOString()
//   ]];

//   await sheets.spreadsheets.values.append({
//     spreadsheetId,
//     range,
//     valueInputOption: 'RAW',
//     resource: { values },
//   });
// };