document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const messageArea = document.getElementById('message-area');
    
    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message-toast ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
        setTimeout(() => messageArea.style.display = 'none', 2000);
    };
    
    // --- Логіка перемикання ролі ---
    const roleSwitchBtn = document.getElementById('role-switch-btn');
    roleSwitchBtn.addEventListener('click', async () => {
        const response = await apiRequest('/change_role', 'POST');
        if (response.success) {
            showMessage('Роль змінено. Повертаємо до панелі керування...');
            setTimeout(() => window.location.href = '/shop-admin.html', 1000);
        } else {
            showMessage('Не вдалося змінити роль.', true);
        }
    });

    const loadAllProducts = async () => {
        // Використовуємо публічний ендпоінт для всіх товарів
        const response = await apiRequest('/products'); 
        if (response.success && response.data.products) {
            productsGrid.innerHTML = ''; // Очищуємо перед рендером
            response.data.products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>${product.description || 'Без опису'}</p>
                    <p class="price">${product.price.toFixed(2)} грн</p>
                    <p>В наявності: ${product.quantity}</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>
                        ${product.quantity === 0 ? 'Немає в наявності' : 'Додати в кошик'}
                    </button>
                `;
                productsGrid.appendChild(card);
            });
        } else {
            productsGrid.innerHTML = '<p>Не вдалося завантажити товари. Спробуйте пізніше.</p>';
        }
    };

    productsGrid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.productId;
            
            // Додаємо товар в кошик (кількість за замовчуванням 1)
            const response = await apiRequest('/cart', 'POST', {
                product_id: parseInt(productId),
                quantity: 1
            });

            if (response.success) {
                showMessage('Товар додано в кошик!');
                e.target.textContent = 'Додано ✓';
                setTimeout(() => { e.target.textContent = 'Додати в кошик'; }, 1500);
            } else {
                showMessage(response.data.message || 'Помилка додавання товару.', true);
            }
        }
    });

    loadAllProducts();
});