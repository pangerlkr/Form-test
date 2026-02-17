const { readForms, writeForms, parseBody, headers } = require('./utils');

exports.handler = async (event, context) => {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/forms', '');
  const segments = path.split('/').filter(Boolean);
  const formId = segments[0];

  try {
    // GET all forms
    if (event.httpMethod === 'GET' && !formId) {
      const forms = readForms();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(forms)
      };
    }

    // GET single form by ID
    if (event.httpMethod === 'GET' && formId) {
      const forms = readForms();
      const form = forms.find(f => f.id === formId);
      if (!form) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Form not found' })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(form)
      };
    }

    // POST - Create new form
    if (event.httpMethod === 'POST' && !formId) {
      const body = await parseBody(event);
      const forms = readForms();
      const newForm = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      forms.push(newForm);
      writeForms(forms);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newForm)
      };
    }

    // PUT - Update form
    if (event.httpMethod === 'PUT' && formId) {
      const body = await parseBody(event);
      const forms = readForms();
      const index = forms.findIndex(f => f.id === formId);
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Form not found' })
        };
      }
      forms[index] = {
        ...forms[index],
        ...body,
        id: formId,
        updatedAt: new Date().toISOString()
      };
      writeForms(forms);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(forms[index])
      };
    }

    // DELETE - Delete form
    if (event.httpMethod === 'DELETE' && formId) {
      const forms = readForms();
      const filteredForms = forms.filter(f => f.id !== formId);
      if (forms.length === filteredForms.length) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Form not found' })
        };
      }
      writeForms(filteredForms);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Form deleted successfully' })
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
