document.addEventListener('DOMContentLoaded', async () => {
    // Універсальна кнопка виходу
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login.html';
    });

    const shopForm = document.getElementById('shop-form');
    const deleteBtn = document.getElementById('delete-shop-btn');
    const messageArea = document.getElementById('message-area');
    
    const shopNameInput = document.getElementById('shop-name');
    const shopDescriptionInput = document.getElementById('shop-description');
    const shopExistsInput = document.getElementById('shop-exists');

    // Функція для відображення повідомлень
    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
    };

    // Завантаження даних про магазин
    const loadShopData = async () => {
        const response = await apiRequest('/store');
        if (response.success) {
            shopNameInput.value = response.data.name;
            shopDescriptionInput.value = response.data.description;
            shopExistsInput.value = 'true';
            deleteBtn.style.display = 'block';
        } else if (response.status === 404) {
            shopExistsInput.value = 'false';
            deleteBtn.style.display = 'none';
        } else {
            showMessage(response.data.message || 'Не вдалося завантажити дані магазину.', true);
        }
    };

    // Обробник відправки форми
    shopForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = shopNameInput.value;
        const description = shopDescriptionInput.value;
        const shopExists = shopExistsInput.value === 'true';

        const method = shopExists ? 'PUT' : 'POST';
        const response = await apiRequest('/store', method, { name, description });

        if (response.success) {
            showMessage(response.data.message || 'Дані магазину збережено!', false);
            if (!shopExists) {
                shopExistsInput.value = 'true';
                deleteBtn.style.display = 'block';
            }
        } else {
            showMessage(response.data.message || 'Сталася помилка.', true);
        }
    });

    // Обробник видалення магазину
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Ви впевнені, що хочете видалити свій магазин? Ця дія незворотня.')) {
            const response = await apiRequest('/store', 'DELETE');
            if (response.success) {
                showMessage('Магазин успішно видалено.', false);
                shopForm.reset();
                shopExistsInput.value = 'false';
                deleteBtn.style.display = 'none';
            } else {
                showMessage(response.data.message || 'Не вдалося видалити магазин.', true);
            }
        }
    });

    await loadShopData();
});