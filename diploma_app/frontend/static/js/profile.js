document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const usernameInput = document.getElementById('profile-username');
    const emailInput = document.getElementById('profile-email');
    const passwordInput = document.getElementById('profile-password');
    const messageArea = document.getElementById('message-area');

    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message-toast ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
        setTimeout(() => messageArea.style.display = 'none', 3000);
    };

    async function loadUserData() {
        const response = await apiRequest('/user');
        if (response.success) {
            usernameInput.value = response.data.username;
            emailInput.value = response.data.email;
        } else {
            showMessage("Не вдалося завантажити дані профілю.", true);
        }
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            username: usernameInput.value,
            email: emailInput.value
        };

        // Додаємо пароль до запиту, тільки якщо він не порожній
        if (passwordInput.value) {
            userData.password = passwordInput.value;
        }
        
        const response = await apiRequest('/user', 'PATCH', userData);

        if (response.success) {
            showMessage("Профіль успішно оновлено.");
            passwordInput.value = ''; // Очищуємо поле пароля
            // Оновлюємо хедер, щоб показати нове ім'я користувача
            await renderHeader(); 
        } else {
            showMessage(response.data.message || "Помилка оновлення профілю.", true);
        }
    });

    loadUserData();
});