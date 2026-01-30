import { clearErrors, setError, isValidEmail, isValidPhone } from './validation.js';

const form = document.getElementById('donationForm');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const amountInput = document.getElementById('amount');
const itemDescGroup = document.getElementById('itemDescGroup');
const donationTypeRadios = document.querySelectorAll('input[name="donationType"]');

export function setAmount(value, buttonEl) {
    amountInput.value = value;

    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    if (buttonEl) buttonEl.classList.add('selected');
}

async function loadProjects() {
    try {
        const projects = await window.apiService.get('/v1/projects');
        const select = document.getElementById('projectSelect');

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });

        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('project');
        if (projectId) select.value = projectId;
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

function validateForm() {
    clearErrors(form);
    let isValid = true;

    const donationType = document.querySelector('input[name="donationType"]:checked').value;
    const amount = parseFloat(amountInput.value);
    const itemDesc = document.getElementById('itemDesc').value.trim();

    if (donationType === 'CASH' && (!amount || amount < 1)) {
        setError('amount', 'Please enter a valid donation amount');
        isValid = false;
    }

    if (donationType !== 'CASH' && !itemDesc) {
        const errorEl = itemDescGroup.querySelector('.error-message') || document.createElement('span');
        errorEl.textContent = 'Please describe what you\'re donating';
        if (!itemDescGroup.querySelector('.error-message')) {
            errorEl.classList.add('error-message');
            itemDescGroup.appendChild(errorEl);
        }
        isValid = false;
    }

    const donorName = document.getElementById('donorName').value.trim();
    if (!donorName) {
        setError('donorName', 'Please enter your full name');
        isValid = false;
    }

    const donorEmail = document.getElementById('donorEmail').value.trim();
    if (!donorEmail) {
        setError('donorEmail', 'Please enter your email address');
        isValid = false;
    } else if (!isValidEmail(donorEmail)) {
        setError('donorEmail', 'Please enter a valid email address');
        isValid = false;
    }

    const donorPhone = document.getElementById('donorPhone').value.trim();
    if (!donorPhone) {
        setError('donorPhone', 'Please enter your phone number');
        isValid = false;
    } else if (!isValidPhone(donorPhone)) {
        setError('donorPhone', 'Please enter a valid phone number');
        isValid = false;
    }

    return isValid;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Processing...';

    try {
        const donationType = document.querySelector('input[name="donationType"]:checked').value;
        const donorName = document.getElementById('donorName').value.trim();
        const donorEmail = document.getElementById('donorEmail').value.trim();
        const donorPhone = document.getElementById('donorPhone').value.trim();
        const donorWard = document.getElementById('donorWard').value.trim();
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const itemDescription = document.getElementById('itemDesc').value.trim();
        const projectId = document.getElementById('projectSelect').value || null;

        await window.apiService.post('/v1/donations', {
            donationType,
            donorName,
            donorEmail,
            donorPhone,
            donorWard,
            amount,
            itemDescription,
            project_id: projectId
        });

        form.style.display = 'none';
        successMessage.classList.add('show');
        successMessage.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error processing your donation. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Process Donation';
    }
});

// Donation type change handling
donationTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const isNonCash = radio.value !== 'CASH';
        itemDescGroup.style.display = isNonCash ? 'block' : 'none';

        if (isNonCash) {
            amountInput.required = false;
            document.querySelector('#amountGroup label').classList.remove('required');
        } else {
            amountInput.required = true;
            document.querySelector('#amountGroup label').classList.add('required');
        }
    });
});

// Wire preset buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (btn) {
        const value = parseInt(btn.dataset.amount, 10);
        if (!isNaN(value)) setAmount(value, btn);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadProjects);

export default {};
