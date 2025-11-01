document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-shop-form');
    const messageArea = document.getElementById('message-area');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('shop-name').value;
        const description = document.getElementById('shop-description').value;

        const response = await apiRequest('/store', 'POST', { name, description });
        
        if (response.success) {
            alert('Магазин успішно створено! Зараз вас буде перенаправлено до панелі керування.');
            window.location.href = '/shop-admin.html';
        } else {
            messageArea.textContent = response.data.message || "Помилка створення магазину.";
            messageArea.className = 'message error';
            messageArea.style.display = 'block';
        }
    });
});