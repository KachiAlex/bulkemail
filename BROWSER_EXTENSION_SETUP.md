# Browser Extension Setup - Quick Start

## ✅ Configuration Complete!

Your browser extension is **fully configured** with your Firebase project:
- ✅ Firebase config: `bulkemail-crm`
- ✅ Functions URL: `https://us-central1-bulkemail-crm.cloudfunctions.net`
- ✅ All files are ready

## 🚀 Installation Steps

### Step 1: Create Icons (Required)

The extension needs icon files. **Quick option:**

1. **Use Online Generator:**
   - Go to: https://favicon.io/favicon-generator/
   - Enter text: "CRM" or emoji: "🔍"
   - Choose colors (LinkedIn blue: #0077b5)
   - Download the package

2. **Rename and Place Icons:**
   - Extract downloaded files
   - Copy to `browser-extension/icons/`:
     - `favicon-16x16.png` → rename to `icon16.png`
     - Create `icon48.png` (resize any icon to 48x48)
     - `favicon-32x32.png` → rename and resize to `icon128.png`

**Or create simple placeholders:**
- Any 16x16, 48x48, 128x128 PNG files
- Can be simple colored squares with text
- Just to get started (can improve later)

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions:**
   ```
   Open Chrome → Menu (⋮) → Extensions → Manage Extensions
   Or go to: chrome://extensions/
   ```

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch (top right)

3. **Load Extension:**
   - Click "Load unpacked" button
   - Navigate to `C:\bulkemail\browser-extension` folder
   - Select the folder and click "Select Folder"

4. **Verify:**
   - You should see "CRM Data Collector" in the extensions list
   - Icon appears in toolbar (or puzzle piece if icons missing)

### Step 3: Test the Extension

1. **Go to LinkedIn:**
   - Navigate to: `https://www.linkedin.com/in/any-profile`
   - Make sure you're logged into LinkedIn

2. **Open Extension:**
   - Click the extension icon in Chrome toolbar
   - Popup should open

3. **First Time Setup:**
   - Click "Log In" button
   - Opens your CRM login page (`http://localhost:3000/login`)
   - Log in with your CRM credentials
   - Return to LinkedIn

4. **Extract Profile:**
   - Click extension icon again
   - Click "Extract Profile Data"
   - Profile information should appear

5. **Collect Data:**
   - Click "Share to Database"
   - Confirm consent dialog
   - You should see "✅ Data collected successfully!"

### Step 4: Verify Data Collection

1. **Check Firestore:**
   - Firebase Console → Firestore → `collectedProfiles` collection
   - You should see the profile you collected

2. **Check Functions Logs:**
   - Firebase Console → Functions → Logs
   - Look for `collectProfileData` function calls

## 📋 Files Structure

```
browser-extension/
├── manifest.json          ✅ Extension configuration
├── popup.html             ✅ Extension popup UI
├── popup.js               ✅ Extension logic
├── content.js             ✅ LinkedIn extraction script
├── firebase-config.js     ✅ Firebase config (configured)
├── icons/                 ⚠️  Need to add icon files
│   ├── icon16.png         ⚠️  Required (16x16)
│   ├── icon48.png         ⚠️  Required (48x48)
│   └── icon128.png        ⚠️  Required (128x128)
├── README.md              ✅ Extension documentation
├── SETUP_GUIDE.md         ✅ Detailed setup guide
└── package.json           ✅ Package info
```

## ⚙️ Configuration

### Already Configured ✅

- **Firebase Project:** `bulkemail-crm`
- **Functions URL:** `https://us-central1-bulkemail-crm.cloudfunctions.net`
- **Auth Domain:** `bulkemail-crm.firebaseapp.com`

### Optional: Customize App URL

If your app runs on a different URL:
1. Edit `browser-extension/popup.js`
2. Line 87: Change `http://localhost:3000` to your URL
3. Or set it in Chrome storage (advanced)

## 🔧 Troubleshooting

### Extension Not Appearing
- Check Chrome console: `chrome://extensions/` → Errors
- Verify all files exist in `browser-extension` folder
- Try reloading the extension

### Icons Missing
- Create icon files in `icons/` folder
- See `icons/ICONS_README.md` for details
- Use any 16x16, 48x48, 128x128 PNG files as placeholder

### Firebase Not Loading
- Check internet connection (SDK loads from CDN)
- Check browser console (F12) for errors
- Verify `firebase-config.js` has correct values

### Login Not Working
- Make sure CRM app is running
- Check URL in `popup.js` matches your app URL
- Log in through main app first, then use extension

### Data Collection Failing
- Verify Firebase Functions are deployed
- Check `collectProfileData` function exists
- Check Functions logs in Firebase Console
- Ensure user is authenticated

### Profile Not Extracting
- Make sure you're on a LinkedIn profile page (`/in/` URL)
- Refresh the LinkedIn page
- Check browser console for errors
- Try a different profile

## 📚 Documentation

- **Detailed Guide:** `browser-extension/SETUP_GUIDE.md`
- **Icon Creation:** `browser-extension/icons/ICONS_README.md`
- **Extension README:** `browser-extension/README.md`

## ✅ Next Steps

1. **Create Icons** - Add icon files to `icons/` folder
2. **Load Extension** - Follow Step 2 above
3. **Test Collection** - Follow Step 3 above
4. **Start Collecting** - Use extension on LinkedIn profiles
5. **Monitor Database** - Watch `collectedProfiles` grow in Firestore

## 🎉 Ready to Use!

Once icons are created and extension is loaded:
- ✅ Extension is configured with your Firebase project
- ✅ Extension can extract LinkedIn profiles
- ✅ Extension can collect data to your database
- ✅ Extension uses hybrid lookup (local + API fallback)

**Start collecting data by visiting LinkedIn profiles!**

---

**Note:** The extension only collects **public** LinkedIn data with **user consent**. All data goes through Firebase Functions for security.

