document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await handleLogin(email, password);
    });

    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const response = await apiRequest('/register', 'POST', { username, email, password });

        if (response.success) {
            // Автоматичний вхід після успішної реєстрації
            await handleLogin(email, password);
        } else {
            document.getElementById('register-error').textContent = response.data.message || 'Помилка реєстрації.';
            document.getElementById('register-error').style.display = 'block';
        }
    });
});

async function handleLogin(email, password) {
    const response = await apiRequest('/login', 'POST', { email, password });
    if (response.success) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        window.location.href = '/index.html';
    } else {
        document.getElementById('login-error').textContent = response.data.message || 'Невірні дані для входу.';
        document.getElementById('login-error').style.display = 'block';
    }
}