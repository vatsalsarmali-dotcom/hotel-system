const API_URL = 'http://localhost:5000/api';
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loadingDiv = document.getElementById('loading');
const roleBtns = document.querySelectorAll('.role-btn');
let selectedRole = 'guest';

// Role selection
roleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    roleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRole = btn.dataset.role;
  });
});

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  successMessage.classList.remove('show');
  setTimeout(() => errorMessage.classList.remove('show'), 5000);
}

// Show success message
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('show');
  errorMessage.classList.remove('show');
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  loadingDiv.style.display = 'block';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Login failed');
      loadingDiv.style.display = 'none';
      return;
    }

    // Check user role matches selected role (for client/admin separation)
    if (selectedRole === 'admin' && !['admin', 'receptionist'].includes(data.user.role)) {
      showError('This account is not an admin account');
      loadingDiv.style.display = 'none';
      return;
    }

    if (selectedRole === 'guest' && data.user.role === 'admin') {
      showError('Please use admin login for this account');
      loadingDiv.style.display = 'none';
      return;
    }

    // Save token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (document.getElementById('rememberMe').checked) {
      localStorage.setItem('rememberEmail', email);
    }

    showSuccess('Login successful! Redirecting...');

    // Redirect based on role
    setTimeout(() => {
      if (data.user.role === 'admin' || data.user.role === 'receptionist') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 1500);
  } catch (error) {
    showError(error.message || 'Connection error. Make sure backend is running.');
    loadingDiv.style.display = 'none';
  }
});

// Load remembered email
window.addEventListener('load', () => {
  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
});
