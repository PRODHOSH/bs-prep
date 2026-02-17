# Google Sheets Setup for Live Classes

## Overview
This guide will help you set up Google Sheets integration to display live classes on your dashboard.

## Prerequisites
- A Google account
- A Google Sheet with live class data

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Live Classes"
4. Set up your first sheet (usually named "Sheet1") with the following columns in Row 1:

   | Subject | Topic | Meeting Link | Time | Date |
   |---------|-------|--------------|------|------|

5. Add your live class data starting from Row 2. Example:

   | Subject | Topic | Meeting Link | Time | Date |
   |---------|-------|--------------|------|------|
   | Mathematics | Linear Algebra | https://meet.google.com/abc-defg-hij | 10:00 | 2026-02-18 |
   | Statistics | Probability Theory | https://meet.google.com/xyz-uvwx-yz | 14:30 | 2026-02-19 |

   **Important Format Notes:**
   - **Time**: Use 24-hour format (HH:MM) - e.g., "10:00" or "14:30"
   - **Date**: Use YYYY-MM-DD format - e.g., "2026-02-18"
   - **Meeting Link**: Full URL including https://

## Step 2: Set Up Google Sheets API

### Option A: Using API Key (Simpler, for read-only access)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Click "Enable APIs and Services"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create an API Key:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the API key (you'll need this later)
   - (Optional) Click "Restrict Key" to add restrictions for security

5. Make your Google Sheet publicly readable:
   - Open your Google Sheet
   - Click "Share" button
   - Click "Change to anyone with the link"
   - Set permission to "Viewer"
   - Click "Done"

### Option B: Using Service Account (More Secure)

1. Follow steps 1-3 from Option A
2. Create a Service Account:
   - Go to "Credentials" → "Create Credentials" → "Service Account"
   - Fill in the details and click "Create"
   - Skip optional steps and click "Done"
3. Download the JSON key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key" → "JSON"
   - Download and save the JSON file securely
4. Share your Google Sheet with the service account:
   - Open your Google Sheet
   - Click "Share"
   - Paste the service account email (from the JSON file: `client_email`)
   - Set permission to "Viewer"
   - Uncheck "Notify people"
   - Click "Share"

## Step 3: Get Your Sheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Copy the `SHEET_ID` part (between `/d/` and `/edit`)

## Step 4: Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

**For Option A (API Key):**
- Use the API key you created

**For Option B (Service Account):**
- You'll need to modify the API route to use service account authentication instead of API key
- Store the service account JSON securely (not in the repository!)

## Step 5: Verify Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard/live-classes` when logged in
3. You should see your live classes displayed

## Troubleshooting

### "Google Sheets credentials not configured"
- Make sure `GOOGLE_SHEET_ID` and `GOOGLE_SHEETS_API_KEY` are set in `.env.local`
- Restart your development server after adding environment variables

### "Google Sheets API error"
- Verify the Sheet ID is correct
- Make sure the Google Sheets API is enabled in your Google Cloud project
- Check that the sheet is shared properly (public or with service account)
- Verify the API key is valid

### Classes not showing
- Check your sheet has data starting from Row 2
- Verify the sheet name is "Sheet1" (or update the range in the API route)
- Check the date format is YYYY-MM-DD
- Check the time format is HH:MM (24-hour)

### Deploy to Production

When deploying to Vercel or other platforms:

1. Add the environment variables to your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Add `GOOGLE_SHEET_ID` and `GOOGLE_SHEETS_API_KEY`

2. Redeploy your application

## Live Class Status Logic

The system automatically determines class status:

- **UPCOMING**: Class is more than 15 minutes away
- **LIVE**: Class starts in 15 minutes or is currently ongoing (up to 60 minutes past start time)
- **COMPLETED**: Class ended more than 60 minutes ago

The page auto-refreshes every 30 seconds to update statuses.

## Google Sheet Template

You can use this template structure:

```
Row 1 (Headers): Subject | Topic | Meeting Link | Time | Date
Row 2: Mathematics | Linear Algebra Basics | https://meet.google.com/abc-defg-hij | 10:00 | 2026-02-18
Row 3: Statistics | Probability Distributions | https://meet.google.com/xyz-uvwx-yz | 14:30 | 2026-02-19
...
```

## Security Notes

- Never commit your `.env.local` file to Git
- Use API key restrictions in Google Cloud Console
- Consider using Service Account for better security
- Regularly rotate your API keys
- Monitor API usage in Google Cloud Console
