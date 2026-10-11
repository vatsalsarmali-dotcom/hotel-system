const API_URL = 'http://localhost:5000/api';
const signupForm = document.getElementById('signupForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const errorMessage = document.getElementById('errorMessage');

// Password strength checker
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  let strength = 0;
  let strengthLabel = '';
  let strengthClass = '';

  if (password.length >= 6) strength += 1;
  if (password.length >= 10) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^a-zA-Z\d]/.test(password)) strength += 1;

  if (strength === 1) {
    strengthLabel = 'Weak';
    strengthClass = 'strength-weak';
    strengthFill.style.width = '20%';
  } else if (strength === 2) {
    strengthLabel = 'Fair';
    strengthClass = 'strength-fair';
    strengthFill.style.width = '40%';
  } else if (strength === 3) {
    strengthLabel = 'Good';
    strengthClass = 'strength-good';
    strengthFill.style.width = '60%';
  } else if (strength >= 4) {
    strengthLabel = 'Strong';
    strengthClass = 'strength-strong';
    strengthFill.style.width = '100%';
  }

  strengthFill.className = 'strength-fill ' + strengthClass;
  strengthText.textContent = strengthLabel ? `Password Strength: ${strengthLabel}` : '';
});

// Show error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => errorMessage.classList.remove('show'), 5000);
}

// Signup handler
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate
  if (!firstName || !lastName || !email || !phone || !password) {
    showError('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  if (!document.getElementById('terms').checked) {
    showError('Please accept the terms and conditions');
    return;
  }

  try {
    // First create guest profile
    const guestResponse = await fetch(`${API_URL}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        idType: 'Passport',
        idNumber: 'To be updated'
      })
    });

    if (!guestResponse.ok) {
      const guestError = await guestResponse.json();
      throw new Error(guestError.error || 'Failed to create guest profile');
    }

    // Then create user account
    const userResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email,
        password,
        role: 'guest',
        phone
      })
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      showError(userData.error || 'Signup failed');
      return;
    }

    // Save token and redirect
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));

    alert('Account created successfully! Redirecting...');

    // Redirect to homepage
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (error) {
    showError(error.message || 'Connection error. Make sure backend is running.');
  }
});
