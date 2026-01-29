export function clearErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

export function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = field && field.nextElementSibling;
    if (errorEl && errorEl.classList.contains('error-message')) {
        errorEl.textContent = message;
    }
}

export function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
}

export function isValidPhone(phone) {
    return phone.replace(/\D/g, '').length >= 9;
}
