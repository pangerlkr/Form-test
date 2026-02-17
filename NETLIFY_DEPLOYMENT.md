# Netlify Deployment Guide

This project has been configured for deployment on Netlify. Follow the steps below to deploy your Form Builder application.

## Prerequisites

1. A [Netlify account](https://www.netlify.com/) (free tier is sufficient)
2. This GitHub repository

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Log in to Netlify**
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub repositories
   - Select the `pangerlkr/Form-test` repository

3. **Configure Build Settings**
   - Netlify should automatically detect the settings from `netlify.toml`
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

4. **Deploy**
   - Click "Deploy site"
   - Wait for the deployment to complete (usually 1-2 minutes)
   - Your site will be live at a URL like `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   # Navigate to your project directory
   cd Form-test

   # Initialize Netlify
   netlify init

   # Deploy
   netlify deploy --prod
   ```

## What's Been Configured

### 1. Netlify Configuration (`netlify.toml`)
- Defines the build command and publish directory
- Configures serverless functions
- Sets up API route redirects

### 2. Serverless Functions (`netlify/functions/`)
All Express API routes have been converted to Netlify serverless functions:
- `forms.js` - Handles form CRUD operations
- `responses.js` - Manages form submissions
- `stats.js` - Provides response statistics
- `upload.js` - Handles file uploads
- `utils.js` - Shared utility functions

### 3. Redirects (`public/_redirects`)
Routes all API calls to the appropriate serverless functions while serving static files for the frontend.

## Important Notes

### Data Persistence
⚠️ **Important**: Netlify serverless functions use `/tmp` storage which is **ephemeral**. This means:
- Data will be lost when the function restarts
- Not suitable for production use without a database

**Recommended Solutions for Production:**
1. Use a database service (MongoDB Atlas, PostgreSQL on Heroku, etc.)
2. Use Netlify's Key-Value Store or Blob Store
3. Integrate with a cloud storage service (AWS S3, Google Cloud Storage)

### File Uploads
The file upload functionality has been adapted for serverless, but for production you should:
- Use a service like Cloudinary, AWS S3, or Uploadcare
- Update the `upload.js` function to integrate with your chosen service

### Environment Variables
If you add external services, set environment variables in Netlify:
1. Go to Site settings → Environment variables
2. Add your API keys and connection strings
3. Access them in your functions via `process.env.VARIABLE_NAME`

## Testing Your Deployment

After deployment:

1. Visit your Netlify URL
2. Test creating a form
3. Test filling out a form
4. Test viewing responses

## Custom Domain (Optional)

To use a custom domain:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Continuous Deployment

Netlify automatically deploys when you push to your GitHub repository:
- Push to main branch → Automatic production deployment
- Pull requests → Deploy previews for testing

## Troubleshooting

### Functions not working?
- Check the Functions tab in Netlify dashboard for errors
- View function logs for debugging information

### Site not loading?
- Verify the build succeeded in the Deploys tab
- Check that the `public` directory is being published

### API calls failing?
- Ensure `_redirects` file is in the `public` directory
- Check function logs for error details

## Support

For issues specific to:
- **Netlify deployment**: Check [Netlify docs](https://docs.netlify.com/)
- **This application**: Open an issue on GitHub

## Next Steps

For a production-ready application, consider:
1. Implementing a proper database
2. Adding user authentication
3. Setting up a proper file storage solution
4. Adding monitoring and error tracking (Sentry, LogRocket, etc.)
5. Implementing rate limiting for API endpoints
