const API_URL = window.location.origin;

// Get form ID from URL
const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get('id');

let form = null;
let responses = [];

async function loadResponses() {
    if (!formId) {
        alert('Form ID not found');
        return;
    }
    
    try {
        // Load form details
        const formResponse = await fetch(`${API_URL}/api/forms/${formId}`);
        form = await formResponse.json();
        document.getElementById('form-title').textContent = `${form.title} - Responses`;
        
        // Load responses
        const responsesResponse = await fetch(`${API_URL}/api/responses/${formId}`);
        responses = await responsesResponse.json();
        
        // Load statistics
        const statsResponse = await fetch(`${API_URL}/api/stats/${formId}`);
        const stats = await statsResponse.json();
        
        displayStats(stats);
        displayCharts(stats);
        displayResponsesTable();
    } catch (error) {
        console.error('Error loading responses:', error);
        alert('Failed to load responses');
    }
}

function displayStats(stats) {
    document.getElementById('total-responses').textContent = stats.totalResponses;
}

function displayCharts(stats) {
    const container = document.getElementById('charts-container');
    container.innerHTML = '';
    
    if (!form || !stats.questionStats) return;
    
    form.questions.forEach(question => {
        if (['multiple-choice', 'checkbox', 'dropdown'].includes(question.type)) {
            const questionStats = stats.questionStats[question.id];
            if (questionStats) {
                createChart(question, questionStats);
            }
        }
    });
}

function createChart(question, stats) {
    const container = document.getElementById('charts-container');
    
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = `
        <h3>${question.title}</h3>
        <canvas id="chart-${question.id}"></canvas>
    `;
    container.appendChild(chartCard);
    
    const ctx = document.getElementById(`chart-${question.id}`).getContext('2d');
    
    const labels = Object.keys(stats);
    const data = Object.values(stats);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Responses',
                data: data,
                backgroundColor: 'rgba(98, 0, 234, 0.6)',
                borderColor: 'rgba(98, 0, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function displayResponsesTable() {
    const tbody = document.querySelector('#responses-table tbody');
    tbody.innerHTML = '';
    
    if (responses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center">No responses yet</td></tr>';
        return;
    }
    
    responses.forEach(response => {
        const row = document.createElement('tr');
        
        const submittedAt = new Date(response.submittedAt).toLocaleString();
        
        const answersHtml = Object.keys(response.answers).map(questionId => {
            const question = form.questions.find(q => q.id === questionId);
            if (!question) return '';
            
            let answer = response.answers[questionId];
            if (Array.isArray(answer)) {
                answer = answer.join(', ');
            }
            
            return `
                <div class="answer-detail">
                    <strong>${question.title}:</strong>
                    <span>${answer}</span>
                </div>
            `;
        }).join('');
        
        row.innerHTML = `
            <td>${submittedAt}</td>
            <td>${answersHtml}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function exportResponses() {
    if (responses.length === 0) {
        alert('No responses to export');
        return;
    }
    
    // Helper function to escape CSV values
    function escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return `"${stringValue}"`;
    }
    
    // Create CSV header
    let csv = 'Submission Time,';
    form.questions.forEach(q => {
        csv += escapeCSV(q.title) + ',';
    });
    csv = csv.slice(0, -1) + '\n';
    
    // Add data rows
    responses.forEach(response => {
        csv += escapeCSV(new Date(response.submittedAt).toLocaleString()) + ',';
        
        form.questions.forEach(q => {
            let answer = response.answers[q.id] || '';
            if (Array.isArray(answer)) {
                answer = answer.join('; ');
            }
            csv += escapeCSV(answer) + ',';
        });
        
        csv = csv.slice(0, -1) + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Load responses when page loads
document.addEventListener('DOMContentLoaded', loadResponses);
