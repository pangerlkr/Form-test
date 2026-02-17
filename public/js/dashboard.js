const API_URL = window.location.origin;

// Load all forms on dashboard
async function loadForms() {
    try {
        const response = await fetch(`${API_URL}/api/forms`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const forms = await response.json();

        const formsGrid = document.getElementById('forms-grid');
        const emptyState = document.getElementById('empty-state');

        // Ensure forms is an array before trying to use it
        if (!Array.isArray(forms)) {
            throw new Error('Invalid response format: expected an array');
        }

        if (forms.length === 0) {
            formsGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            formsGrid.style.display = 'grid';
            emptyState.style.display = 'none';

            formsGrid.innerHTML = forms.map(form => `
                <div class="form-card">
                    <h3>${form.title || 'Untitled Form'}</h3>
                    <p>${form.description || 'No description'}</p>
                    <p style="font-size: 0.8rem; color: #999;">
                        Created: ${new Date(form.createdAt).toLocaleDateString()}
                    </p>
                    <div class="form-card-actions">
                        <button class="btn btn-secondary" onclick="viewForm('${form.id}')">Fill Form</button>
                        <button class="btn btn-secondary" onclick="viewResponses('${form.id}')">Responses</button>
                        <button class="btn btn-secondary" onclick="editForm('${form.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteForm('${form.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading forms:', error);
        alert('Failed to load forms');
    }
}

function viewForm(formId) {
    window.location.href = `/fill-form.html?id=${formId}`;
}

function viewResponses(formId) {
    window.location.href = `/responses.html?id=${formId}`;
}

function editForm(formId) {
    window.location.href = `/create-form.html?id=${formId}`;
}

async function deleteForm(formId) {
    if (!confirm('Are you sure you want to delete this form?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/forms/${formId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Form deleted successfully');
            loadForms();
        } else {
            alert('Failed to delete form');
        }
    } catch (error) {
        console.error('Error deleting form:', error);
        alert('Failed to delete form');
    }
}

// Load forms when page loads
document.addEventListener('DOMContentLoaded', loadForms);
