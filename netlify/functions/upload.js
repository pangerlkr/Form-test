const { headers } = require('./utils');

// For Netlify functions, file uploads are more complex
// This is a simplified version that handles base64 encoded files
exports.handler = async (event, context) => {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Parse the body - expecting JSON with base64 encoded file
      const body = JSON.parse(event.body || '{}');

      if (!body.file || !body.filename) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No file uploaded. Please send file as base64 in JSON format with "file" and "filename" fields.' })
        };
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = body.filename.split('.').pop();
      const filename = uniqueSuffix + '.' + ext;

      // In a real Netlify deployment, you would:
      // 1. Upload to a cloud storage service (S3, Cloudinary, etc.)
      // 2. Return the URL
      // For now, we return a mock response
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          url: `/uploads/${filename}`,
          filename: body.filename
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to upload file' })
    };
  }
};
