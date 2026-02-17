const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Data file paths
const FORMS_FILE = path.join(__dirname, '../data/forms.json');
const RESPONSES_FILE = path.join(__dirname, '../data/responses.json');

// Initialize data files if they don't exist
function initializeDataFiles() {
  if (!fs.existsSync(FORMS_FILE)) {
    fs.writeFileSync(FORMS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(RESPONSES_FILE)) {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify([], null, 2));
  }
}

initializeDataFiles();

// Helper functions to read/write data
function readForms() {
  const data = fs.readFileSync(FORMS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeForms(forms) {
  fs.writeFileSync(FORMS_FILE, JSON.stringify(forms, null, 2));
}

function readResponses() {
  const data = fs.readFileSync(RESPONSES_FILE, 'utf8');
  return JSON.parse(data);
}

function writeResponses(responses) {
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

// API Routes

// Get all forms
app.get('/api/forms', (req, res) => {
  try {
    const forms = readForms();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get a single form by ID
app.get('/api/forms/:id', (req, res) => {
  try {
    const forms = readForms();
    const form = forms.find(f => f.id === req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create a new form
app.post('/api/forms', (req, res) => {
  try {
    const forms = readForms();
    const newForm = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    forms.push(newForm);
    writeForms(forms);
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update a form
app.put('/api/forms/:id', (req, res) => {
  try {
    const forms = readForms();
    const index = forms.findIndex(f => f.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Form not found' });
    }
    forms[index] = {
      ...forms[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    writeForms(forms);
    res.json(forms[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete a form
app.delete('/api/forms/:id', (req, res) => {
  try {
    const forms = readForms();
    const filteredForms = forms.filter(f => f.id !== req.params.id);
    if (forms.length === filteredForms.length) {
      return res.status(404).json({ error: 'Form not found' });
    }
    writeForms(filteredForms);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Submit a form response
app.post('/api/responses', (req, res) => {
  try {
    const responses = readResponses();
    const newResponse = {
      id: Date.now().toString(),
      ...req.body,
      submittedAt: new Date().toISOString()
    };
    responses.push(newResponse);
    writeResponses(responses);
    res.status(201).json(newResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get all responses for a form
app.get('/api/responses/:formId', (req, res) => {
  try {
    const responses = readResponses();
    const formResponses = responses.filter(r => r.formId === req.params.formId);
    res.json(formResponses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Get statistics for a form
app.get('/api/stats/:formId', (req, res) => {
  try {
    const responses = readResponses();
    const formResponses = responses.filter(r => r.formId === req.params.formId);
    
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

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
