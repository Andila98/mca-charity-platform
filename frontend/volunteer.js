document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('volunteerForm');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Reset previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        let isValid = true;

        // Get values
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const location = document.getElementById('location').value.trim();

        // Validation
        if (!fullName) {
            setError('fullName', 'Please enter your full name');
            isValid = false;
        }

        if (!phone) {
            setError('phone', 'Please enter your phone number');
            isValid = false;
        } else if (!/^\+?[0-9\s-]{10,}$/.test(phone.replace(/\s/g, ''))) {
            setError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        if (!email) {
            setError('email', 'Please enter your email address');
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!location) {
            setError('location', 'Please enter your city and country');
            isValid = false;
        }

        if (isValid) {
            // Demo success: hide form, show thank you
            form.style.display = 'none';
            successMessage.classList.remove('hidden');

            // In real implementation: send data via fetch() to backend or Formspree
            console.log('Form Data:', {
                fullName,
                phone,
                email,
                location,
                message: document.getElementById('message').value.trim()
            });
        }
    });

    function setError(fieldId, message) {
        const errorEl = document.querySelector(`#${fieldId} ~ .error-message`);
        if (errorEl) errorEl.textContent = message;
    }
});