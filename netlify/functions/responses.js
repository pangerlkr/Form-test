const { readResponses, writeResponses, parseBody, headers } = require('./utils');

exports.handler = async (event, context) => {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/responses', '');
  const segments = path.split('/').filter(Boolean);
  const formId = segments[0];

  try {
    // POST - Submit a form response
    if (event.httpMethod === 'POST' && !formId) {
      const body = await parseBody(event);
      const responses = readResponses();
      const newResponse = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        ...body,
        submittedAt: new Date().toISOString()
      };
      responses.push(newResponse);
      writeResponses(responses);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newResponse)
      };
    }

    // GET - Get all responses for a form
    if (event.httpMethod === 'GET' && formId) {
      const responses = readResponses();
      const formResponses = responses.filter(r => r.formId === formId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formResponses)
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
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
