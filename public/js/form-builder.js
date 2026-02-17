const API_URL = window.location.origin;
let questions = [];
let editingFormId = null;

// Get form ID from URL if editing
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('id');

// Load existing form if editing
async function loadExistingForm() {
    if (formId) {
        try {
            const response = await fetch(`${API_URL}/api/forms/${formId}`);
            const form = await response.json();
            
            document.getElementById('form-title').value = form.title;
            document.getElementById('form-description').value = form.description || '';
            document.getElementById('theme-color').value = form.theme || '#6200ea';
            document.getElementById('header-image').value = form.headerImage || '';
            document.getElementById('header-video').value = form.headerVideo || '';
            
            questions = form.questions || [];
            editingFormId = formId;
            renderQuestions();
        } catch (error) {
            console.error('Error loading form:', error);
            alert('Failed to load form');
        }
    }
}

function addQuestion(type) {
    const question = {
        id: Date.now().toString(),
        type: type,
        title: 'Question',
        required: false,
        options: type === 'multiple-choice' || type === 'checkbox' || type === 'dropdown' 
            ? ['Option 1'] 
            : []
    };
    
    questions.push(question);
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = questions.map((q, index) => `
        <div class="question-block" data-index="${index}">
            <div class="question-header">
                <input type="text" 
                       class="question-title-input" 
                       value="${q.title}"
                       onchange="updateQuestionTitle(${index}, this.value)"
                       placeholder="Question">
                <div class="question-actions">
                    <button class="btn btn-secondary" onclick="moveQuestion(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn btn-secondary" onclick="moveQuestion(${index}, 1)" ${index === questions.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="btn btn-danger" onclick="deleteQuestion(${index})">✕</button>
                </div>
            </div>
            
            <select class="question-type-select" onchange="changeQuestionType(${index}, this.value)">
                <option value="text" ${q.type === 'text' ? 'selected' : ''}>Short Answer</option>
                <option value="textarea" ${q.type === 'textarea' ? 'selected' : ''}>Paragraph</option>
                <option value="multiple-choice" ${q.type === 'multiple-choice' ? 'selected' : ''}>Multiple Choice</option>
                <option value="checkbox" ${q.type === 'checkbox' ? 'selected' : ''}>Checkboxes</option>
                <option value="dropdown" ${q.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
                <option value="file" ${q.type === 'file' ? 'selected' : ''}>File Upload</option>
            </select>
            
            ${renderQuestionOptions(q, index)}
            
            <div class="question-required">
                <label>
                    <input type="checkbox" 
                           ${q.required ? 'checked' : ''} 
                           onchange="toggleRequired(${index})">
                    Required
                </label>
            </div>
        </div>
    `).join('');
}

function renderQuestionOptions(question, qIndex) {
    if (['multiple-choice', 'checkbox', 'dropdown'].includes(question.type)) {
        return `
            <div class="question-options">
                ${question.options.map((opt, optIndex) => `
                    <div class="option-item">
                        <span>${question.type === 'multiple-choice' ? '○' : question.type === 'checkbox' ? '☐' : `${optIndex + 1}.`}</span>
                        <input type="text" 
                               value="${opt}" 
                               onchange="updateOption(${qIndex}, ${optIndex}, this.value)"
                               placeholder="Option ${optIndex + 1}">
                        <button class="btn btn-danger" onclick="removeOption(${qIndex}, ${optIndex})">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary" onclick="addOption(${qIndex})">+ Add Option</button>
            </div>
        `;
    }
    return '';
}

function updateQuestionTitle(index, value) {
    questions[index].title = value;
}

function changeQuestionType(index, type) {
    questions[index].type = type;
    if (['multiple-choice', 'checkbox', 'dropdown'].includes(type) && !questions[index].options.length) {
        questions[index].options = ['Option 1'];
    }
    renderQuestions();
}

function toggleRequired(index) {
    questions[index].required = !questions[index].required;
}

function addOption(qIndex) {
    questions[qIndex].options.push(`Option ${questions[qIndex].options.length + 1}`);
    renderQuestions();
}

function updateOption(qIndex, optIndex, value) {
    questions[qIndex].options[optIndex] = value;
}

function removeOption(qIndex, optIndex) {
    questions[qIndex].options.splice(optIndex, 1);
    renderQuestions();
}

function deleteQuestion(index) {
    if (confirm('Delete this question?')) {
        questions.splice(index, 1);
        renderQuestions();
    }
}

function moveQuestion(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < questions.length) {
        [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
        renderQuestions();
    }
}

async function saveForm() {
    const title = document.getElementById('form-title').value;
    const description = document.getElementById('form-description').value;
    const theme = document.getElementById('theme-color').value;
    const headerImage = document.getElementById('header-image').value;
    const headerVideo = document.getElementById('header-video').value;
    
    if (!title.trim()) {
        alert('Please enter a form title');
        return;
    }
    
    if (questions.length === 0) {
        alert('Please add at least one question');
        return;
    }
    
    const formData = {
        title,
        description,
        theme,
        headerImage,
        headerVideo,
        questions
    };
    
    try {
        const url = editingFormId 
            ? `${API_URL}/api/forms/${editingFormId}` 
            : `${API_URL}/api/forms`;
        
        const response = await fetch(url, {
            method: editingFormId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Form saved successfully!');
            window.location.href = '/index.html';
        } else {
            alert('Failed to save form');
        }
    } catch (error) {
        console.error('Error saving form:', error);
        alert('Failed to save form');
    }
}

function previewForm() {
    if (editingFormId) {
        window.open(`/fill-form.html?id=${editingFormId}`, '_blank');
    } else {
        alert('Please save the form first before previewing');
    }
}

// Load existing form if editing
document.addEventListener('DOMContentLoaded', loadExistingForm);
