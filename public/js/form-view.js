const API_URL = window.location.origin;

// Get form ID from URL
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('id');

async function loadForm() {
    if (!formId) {
        document.getElementById('form-container').innerHTML = '<p>Form not found</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/forms/${formId}`);
        const form = await response.json();
        
        renderForm(form);
    } catch (error) {
        console.error('Error loading form:', error);
        document.getElementById('form-container').innerHTML = '<p>Failed to load form</p>';
    }
}

function renderForm(form) {
    const container = document.getElementById('form-container');
    
    let mediaHtml = '';
    if (form.headerImage) {
        mediaHtml += `<img src="${form.headerImage}" alt="Form header">`;
    }
    if (form.headerVideo) {
        mediaHtml += `<iframe src="${form.headerVideo}" allowfullscreen></iframe>`;
    }
    
    const headerStyle = form.theme ? `style="border-bottom-color: ${form.theme}"` : '';
    
    container.innerHTML = `
        <div class="form-view-header" ${headerStyle}>
            <h2>${form.title}</h2>
            ${form.description ? `<p>${form.description}</p>` : ''}
            ${mediaHtml ? `<div class="form-header-media">${mediaHtml}</div>` : ''}
        </div>
        
        <form id="response-form">
            ${form.questions.map((q, index) => renderQuestion(q, index)).join('')}
            <button type="submit" class="btn btn-primary submit-form-btn">Submit</button>
        </form>
    `;
    
    document.getElementById('response-form').addEventListener('submit', handleSubmit);
}

function renderQuestion(question, index) {
    const required = question.required ? 'required' : '';
    const requiredLabel = question.required ? '<span style="color: red;">*</span>' : '';
    
    let inputHtml = '';
    
    switch (question.type) {
        case 'text':
            inputHtml = `<input type="text" name="q${index}" ${required} placeholder="Your answer">`;
            break;
            
        case 'textarea':
            inputHtml = `<textarea name="q${index}" ${required} placeholder="Your answer"></textarea>`;
            break;
            
        case 'multiple-choice':
            inputHtml = question.options.map((opt, optIndex) => `
                <label class="option-label">
                    <input type="radio" name="q${index}" value="${opt}" ${required}>
                    ${opt}
                </label>
            `).join('');
            break;
            
        case 'checkbox':
            inputHtml = question.options.map((opt, optIndex) => `
                <label class="option-label">
                    <input type="checkbox" name="q${index}" value="${opt}">
                    ${opt}
                </label>
            `).join('');
            break;
            
        case 'dropdown':
            inputHtml = `
                <select name="q${index}" ${required}>
                    <option value="">Choose</option>
                    ${question.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            `;
            break;
            
        case 'file':
            inputHtml = `<input type="file" name="q${index}" ${required} onchange="handleFileUpload(event, ${index})">
                        <input type="hidden" name="q${index}_url" id="file-url-${index}">`;
            break;
    }
    
    return `
        <div class="question-view" data-question-id="${question.id}">
            <label>${question.title} ${requiredLabel}</label>
            ${inputHtml}
        </div>
    `;
}

async function handleFileUpload(event, questionIndex) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        document.getElementById(`file-url-${questionIndex}`).value = data.url;
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const answers = {};
    
    // Process form data
    const questions = document.querySelectorAll('.question-view');
    questions.forEach((questionDiv, index) => {
        const questionId = questionDiv.dataset.questionId;
        const name = `q${index}`;
        
        // Handle checkboxes (multiple values)
        const checkboxes = questionDiv.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`);
        if (checkboxes.length > 0) {
            answers[questionId] = Array.from(checkboxes).map(cb => cb.value);
        } else {
            // Handle file uploads
            const fileUrl = formData.get(`${name}_url`);
            if (fileUrl) {
                answers[questionId] = fileUrl;
            } else {
                // Handle other input types
                const value = formData.get(name);
                if (value) {
                    answers[questionId] = value;
                }
            }
        }
    });
    
    const response = {
        formId: formId,
        answers: answers
    };
    
    try {
        const res = await fetch(`${API_URL}/api/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        });
        
        if (res.ok) {
            document.getElementById('form-container').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
        } else {
            alert('Failed to submit response');
        }
    } catch (error) {
        console.error('Error submitting response:', error);
        alert('Failed to submit response');
    }
}

// Load form when page loads
document.addEventListener('DOMContentLoaded', loadForm);
