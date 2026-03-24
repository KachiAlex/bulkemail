# 🚀 Deploy Data Collection Functions

## Status: ⚠️ Functions Need Deployment

The new data collection functions are **not yet deployed**. You need to deploy them before using the browser extension.

## Functions to Deploy

1. **`collectProfileData`** - Receives data from browser extension
2. **`lookupContactLocal`** - Searches local database
3. **`lookupContactHybrid`** - Hybrid lookup (local + API)
4. **`extractLeadFromLinkedIn`** - Updated with hybrid approach

## Deploy Commands

### Option 1: Deploy All Functions
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Option 2: Deploy Specific Functions
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions:collectProfileData,functions:lookupContactLocal,functions:lookupContactHybrid,functions:extractLeadFromLinkedIn
```

### Option 3: Deploy from Root
```bash
npm run build --prefix functions
firebase deploy --only functions
```

## Verify Deployment

After deployment, check functions are listed:
```bash
firebase functions:list
```

You should see:
- ✅ `collectProfileData`
- ✅ `lookupContactLocal`
- ✅ `lookupContactHybrid`
- ✅ `extractLeadFromLinkedIn`

## Check Deployment Status

Go to Firebase Console:
1. Firebase Console → Functions
2. Check that these functions are listed:
   - `collectProfileData` (us-central1)
   - `lookupContactLocal` (us-central1)
   - `lookupContactHybrid` (us-central1)
   - `extractLeadFromLinkedIn` (us-central1)

## Troubleshooting

### Build Errors
If build fails:
```bash
cd functions
npm install
npm run build
# Check for TypeScript errors
```

### Deployment Errors
If deployment fails:
```bash
# Check Firebase login
firebase login

# Check project
firebase projects:list
firebase use bulkemail-crm

# Try deploying again
firebase deploy --only functions
```

### Function Not Found
If function not found after deployment:
1. Check Firebase Console → Functions
2. Verify function name matches exactly
3. Check region (should be us-central1)
4. Wait a few minutes for propagation

## Next Steps After Deployment

1. ✅ Verify functions are deployed
2. ✅ Create extension icons
3. ✅ Load extension in Chrome
4. ✅ Test data collection
5. ✅ Verify data in Firestore

## Expected Deployment Time

- Build: 1-2 minutes
- Deploy: 2-5 minutes
- Total: 3-7 minutes

---

**Ready to deploy? Run the deploy command above! 🚀**

