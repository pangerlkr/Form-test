const { readResponses, headers } = require('./utils');

exports.handler = async (event, context) => {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/stats', '');
  const segments = path.split('/').filter(Boolean);
  const formId = segments[0];

  try {
    // GET - Get statistics for a form
    if (event.httpMethod === 'GET' && formId) {
      const responses = readResponses();
      const formResponses = responses.filter(r => r.formId === formId);

      const stats = {
        totalResponses: formResponses.length,
        submissionTimeline: formResponses.map(r => ({
          date: new Date(r.submittedAt).toLocaleDateString(),
          count: 1
        }))
      };

      // Calculate question-wise statistics
      if (formResponses.length > 0) {
        const questionStats = {};
        formResponses.forEach(response => {
          Object.keys(response.answers || {}).forEach(questionId => {
            if (!questionStats[questionId]) {
              questionStats[questionId] = {};
            }
            const answer = response.answers[questionId];
            if (Array.isArray(answer)) {
              answer.forEach(a => {
                questionStats[questionId][a] = (questionStats[questionId][a] || 0) + 1;
              });
            } else {
              questionStats[questionId][answer] = (questionStats[questionId][answer] || 0) + 1;
            }
          });
        });
        stats.questionStats = questionStats;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
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
