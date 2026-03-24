# CRM Data Collector - Browser Extension

A browser extension that collects public LinkedIn profile data to build your own contact database.

## Features

- Extract public LinkedIn profile data (name, title, company, location)
- Share data to your CRM database (with user consent)
- GDPR compliant - only collects public data with explicit consent
- Automatically builds your own contact database
- Reduces reliance on third-party APIs

## Installation

### For Development:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension should now appear in your extensions list

### For Production:

1. Build the extension (zip the folder)
2. Publish to Chrome Web Store (requires developer account)
3. Or distribute as a .crx file for internal use

## Setup

1. **Configure Firebase:**
   - Edit `firebase-config.js`
   - Replace with your Firebase project credentials
   - Set your Firebase Functions URL

2. **Update Functions URL:**
   - The extension needs to know where your Firebase Functions are hosted
   - Update `functionsUrl` in `firebase-config.js`
   - Or set it in extension storage via options page

## Usage

1. Navigate to a LinkedIn profile page (e.g., `https://www.linkedin.com/in/username`)
2. Click the extension icon in your browser toolbar
3. If not logged in, click "Log In" (opens your CRM login page)
4. Click "Extract Profile Data" to load the current profile
5. Review the extracted data
6. Click "Share to Database" to contribute the data (with consent)

## How It Works

1. **Content Script**: Runs on LinkedIn pages and extracts visible profile data
2. **Popup UI**: Displays extracted data and allows user to contribute
3. **Firebase Function**: Receives data via `collectProfileData` function
4. **Database**: Stores data in Firestore `collectedProfiles` collection
5. **Lookup**: Data is used by hybrid lookup system to reduce API calls

## Privacy & Compliance

- ✅ Only collects **public** LinkedIn profile data
- ✅ Requires **explicit user consent** before sharing
- ✅ GDPR compliant
- ✅ No private data collected
- ✅ Users can log out and data is not stored locally

## Troubleshooting

### Extension not working:
- Refresh the LinkedIn page after installing the extension
- Check that you're on a profile page (`/in/` URL)
- Check browser console for errors

### Login not working:
- Ensure Firebase config is correct
- Check that your CRM app allows CORS from extension
- Try logging in through the main app first

### Data not collecting:
- Check Firebase Functions logs
- Verify `collectProfileData` function is deployed
- Check network tab for API errors

## Building Icons

The extension needs icons in `icons/` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can create simple icons or use an icon generator.

## Security Notes

- Never commit `firebase-config.js` with real credentials to public repos
- Use environment variables or build-time configuration for production
- Review extension permissions before publishing

## Next Steps

1. Add options page for configuration
2. Add contribution statistics
3. Add data verification features
4. Support for other platforms (GitHub, Twitter, etc.)

