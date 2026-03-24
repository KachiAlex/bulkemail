# Browser Extension Setup Guide

## Quick Setup

### Step 1: Create Icons (Required)

The extension needs icon files in the `icons/` folder:

1. **Create or download icons:**
   - Go to https://favicon.io/favicon-generator/
   - Create icons (16x16, 48x48, 128x128)
   - Or use any image editor to create PNG files
   - Place them in `browser-extension/icons/` folder:
     - `icon16.png` (16x16)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)

2. **Quick placeholder option:**
   - Create simple colored squares with text "CRM"
   - Use any online icon generator
   - See `icons/ICONS_README.md` for more details

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions:**
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch (top right)
   - You'll see new buttons appear

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to the `browser-extension` folder
   - Select the folder and click "Select Folder"
   - The extension should now appear in your extensions list

4. **Verify Installation:**
   - You should see "CRM Data Collector" in your extensions list
   - The extension icon should appear in your toolbar
   - If icons are missing, you'll see a puzzle piece icon

### Step 3: Configure Extension (Optional)

The extension is already configured with your Firebase project:
- ✅ Firebase config: `firebase-config.js` (already set up)
- ✅ Functions URL: `https://us-central1-bulkemail-crm.cloudfunctions.net`

**Optional: Set App URL for Login**
- If your app runs on a different URL, you can set it:
  1. Right-click extension icon → Options (if available)
  2. Or edit `popup.js` line 87: change `http://localhost:3000` to your URL

### Step 4: Test the Extension

1. **Go to LinkedIn:**
   - Navigate to any LinkedIn profile (e.g., `https://www.linkedin.com/in/username`)
   - Make sure you're logged into LinkedIn

2. **Open Extension:**
   - Click the extension icon in your Chrome toolbar
   - The popup should open

3. **Login (First Time):**
   - Click "Log In" button
   - This opens your CRM login page
   - Log in with your CRM credentials
   - Return to LinkedIn and click the extension icon again

4. **Extract Profile:**
   - Click "Extract Profile Data" button
   - You should see the profile information appear
   - Review the data (name, title, company, location)

5. **Share to Database:**
   - Click "Share to Database" button
   - Confirm the consent dialog
   - You should see "✅ Data collected successfully!"

### Step 5: Verify Data Collection

1. **Check Firestore:**
   - Go to Firebase Console → Firestore
   - Check `collectedProfiles` collection
   - You should see the profile you just collected

2. **Check Function Logs:**
   - Go to Firebase Console → Functions → Logs
   - You should see `collectProfileData` function logs

## Troubleshooting

### Extension Not Appearing

**Problem:** Extension doesn't show up after loading

**Solutions:**
- Check Chrome console for errors (`chrome://extensions/` → Developer mode → Errors)
- Make sure all files are in the `browser-extension` folder
- Verify `manifest.json` is valid JSON
- Reload the extension (click reload icon)

### Icons Not Showing

**Problem:** Extension shows puzzle piece icon

**Solutions:**
- Make sure icon files exist in `icons/` folder
- Check icon file names match exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Verify icons are PNG format
- Reload the extension

### Firebase Not Initializing

**Problem:** "Firebase SDK not loaded" error

**Solutions:**
- Check internet connection (Firebase SDK loads from CDN)
- Verify `firebase-config.js` has correct config
- Check browser console for errors (F12 → Console)
- Try refreshing the extension

### Login Not Working

**Problem:** "Please log in through the main application" error

**Solutions:**
- Make sure your CRM app is running
- Check the URL in `popup.js` line 87 matches your app URL
- Log in through the main app first, then use extension
- Check Firebase Auth is properly configured

### Data Collection Failing

**Problem:** "Failed to collect data" error

**Solutions:**
- Check Firebase Functions are deployed
- Verify `collectProfileData` function exists
- Check Functions logs in Firebase Console
- Ensure user is authenticated
- Check Firestore rules allow writes

### Profile Not Extracting

**Problem:** "Could not extract profile data"

**Solutions:**
- Make sure you're on a LinkedIn profile page (`/in/` URL)
- Refresh the LinkedIn page
- Try a different profile
- Check browser console for errors
- Make sure LinkedIn page is fully loaded

## Development Tips

### Reload Extension After Changes

After editing files:
1. Go to `chrome://extensions/`
2. Find "CRM Data Collector"
3. Click the reload icon (🔄)
4. Test the changes

### Debug Extension

1. **View Extension Console:**
   - Right-click extension popup → Inspect
   - Check Console tab for errors

2. **Check Background Scripts:**
   - Go to `chrome://extensions/`
   - Click "service worker" or "background page" link
   - View console for content script errors

3. **View Network Requests:**
   - Open DevTools (F12)
   - Go to Network tab
   - Use extension and check requests to Firebase

### Update Firebase Config

If your Firebase project changes:
1. Edit `browser-extension/firebase-config.js`
2. Update config values
3. Reload extension

## Next Steps

1. ✅ **Extension is installed** - You're ready to collect data
2. ✅ **Extension is configured** - Firebase is set up
3. 📝 **Create icons** - Add proper icons for production
4. 🔄 **Test collection** - Try collecting a profile
5. 📊 **Monitor database** - Watch your database grow

## Production Deployment

Before publishing to Chrome Web Store:

1. **Create proper icons** (not placeholders)
2. **Update manifest version** in `manifest.json`
3. **Test thoroughly** on multiple LinkedIn profiles
4. **Add privacy policy** URL to manifest
5. **Create store listing** with screenshots and description
6. **Submit for review** to Chrome Web Store

## Security Notes

- ✅ Extension only collects **public** LinkedIn data
- ✅ Requires **explicit user consent** before sharing
- ✅ Uses **Firebase Authentication** for security
- ✅ All data goes through **Firebase Functions** (secure backend)
- ✅ **GDPR compliant** - users can request data deletion

---

**Your extension is ready to use!** 🎉

Start collecting data by visiting LinkedIn profiles and using the extension.

