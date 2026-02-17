const fs = require('fs');
const path = require('path');

// Data file paths - in Netlify, we need to handle this differently
// Using /tmp for writable storage in serverless functions
const getTmpDir = () => {
  const tmpDir = '/tmp/form-data';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  return tmpDir;
};

const FORMS_FILE = () => path.join(getTmpDir(), 'forms.json');
const RESPONSES_FILE = () => path.join(getTmpDir(), 'responses.json');

// Initialize data files if they don't exist
function initializeDataFiles() {
  const formsFile = FORMS_FILE();
  const responsesFile = RESPONSES_FILE();

  if (!fs.existsSync(formsFile)) {
    fs.writeFileSync(formsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(responsesFile)) {
    fs.writeFileSync(responsesFile, JSON.stringify([], null, 2));
  }
}

// Helper functions to read/write data
function readForms() {
  try {
    initializeDataFiles();
    const data = fs.readFileSync(FORMS_FILE(), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading forms:', error);
    return [];
  }
}

function writeForms(forms) {
  initializeDataFiles();
  fs.writeFileSync(FORMS_FILE(), JSON.stringify(forms, null, 2));
}

function readResponses() {
  try {
    initializeDataFiles();
    const data = fs.readFileSync(RESPONSES_FILE(), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading responses:', error);
    return [];
  }
}

function writeResponses(responses) {
  initializeDataFiles();
  fs.writeFileSync(RESPONSES_FILE(), JSON.stringify(responses, null, 2));
}

// Helper to parse request body
async function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return {};
  }
}

// Standard headers for CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

module.exports = {
  readForms,
  writeForms,
  readResponses,
  writeResponses,
  parseBody,
  headers,
  initializeDataFiles
};
