# Cloudmersive Setup Guide

## Quick Answer to "What Programming Language?"

**Answer: Any of these works** - The integration uses simple HTTP REST API calls:

- JavaScript/Node.js (Recommended for our setup - we're using TypeScript/JavaScript)
- Python
- PHP
- Java
- C#
- Ruby
- Go
- etc.

**Just pick one** - We've already integrated it using standard HTTP requests, so the language doesn't matter. You just need the API key.

## Step-by-Step Setup

### 1. Sign Up
1. Visit: https://portal.cloudmersive.com/signup
2. Click "Sign Up" or "Get Started"
3. Fill in your details
4. **No credit card required**

### 2. When Asked "What Programming Language?"
- Select **"JavaScript"** or **"Node.js"** 
- Or you can select any other language - it doesn't matter for our implementation
- This is just for their documentation/examples
- The API key works with any language

### 3. Get Your API Key
1. After signing up, log in to your dashboard
2. Navigate to your API keys section
3. Copy your API key (it will look something like: `abc123def456...`)

### 4. Configure in Your Project
1. Create a file named `.env` in the `frontend` folder (if it doesn't exist)
2. Add this line:
   ```
   VITE_CLOUDMERSIVE_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with the actual key you copied
4. Save the file

### 5. Restart Your Dev Server (if running)
If you're running the app locally:
```bash
# Stop the current dev server (Ctrl+C)
# Then start it again
npm run dev
```

### 6. Test It
1. Try creating or updating a contact with an email
2. You should see a validation result
3. Check the browser console for verification details

## How It Works

The email validation happens **in the browser** (frontend), not on the backend. So you don't need to set anything up on the server side.

When you add or update a contact:
1. The form submits the email
2. Our code calls Cloudmersive's API from the browser
3. Cloudmersive verifies the email
4. The result is saved with the contact

## Important Notes

- ✅ **The .env file is already configured** to work with your setup
- ✅ **No backend changes needed** - everything works on the frontend
- ✅ **The API key is safe** to use from the browser (it's limited to 800 requests/month)
- ⚠️ **Don't commit the .env file** to git (it should already be in .gitignore)

## Troubleshooting

### "API not working"
1. Make sure your `.env` file is in the `frontend` folder
2. The variable name must be exactly: `VITE_CLOUDMERSIVE_API_KEY`
3. Restart your dev server after adding the key
4. Check the browser console for errors

### "Where do I find my API key?"
1. Log in to https://portal.cloudmersive.com
2. Look for "API Keys" or "My Account" section
3. Copy the key that looks like a long alphanumeric string

### "Does it matter what language I select?"
**No!** The language selection is just for their documentation and code examples. The API key works with any language because it's a REST API.

## Free Tier Details

- **800 API calls per month** (totally free)
- Resets every month
- No credit card required
- Monitor usage in your dashboard
- When limit is reached, the system falls back to basic validation

That's it! You're all set. 🎉

