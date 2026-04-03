This folder will contain Netlify Functions copied from the compiled `functions/lib` directory.
Files are copied during the `npm run build:netlify` step using `scripts/copy-netlify-functions.js`.

Netlify will deploy each file here as a serverless function.
