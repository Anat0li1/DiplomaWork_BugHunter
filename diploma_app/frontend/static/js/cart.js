document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const messageArea = document.getElementById('message-area'); // Повинно бути на cart.html
    const placeOrderBtn = document.getElementById('place-order-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    const showMessage = (message, isError = false) => {
        // Адаптовано під нову систему повідомлень
        const toast = document.createElement('div');
        toast.className = `message-toast ${isError ? 'error' : 'success'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.style.display = 'block';
        setTimeout(() => toast.remove(), 3000);
    };

    const loadCart = async () => {
        const response = await apiRequest('/cart');
        cartItemsContainer.innerHTML = '';

        if (response.success && response.data.cart && response.data.cart.length > 0) {
            const items = response.data.cart;
            placeOrderBtn.style.display = 'inline-block';
            clearCartBtn.style.display = 'inline-block';

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item'; // Потрібно додати стилі для цього класу
                itemDiv.innerHTML = `
                    <h4>${item.product_name || `Товар #${item.product_id}`}</h4>
                    <input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1">
                    <button class="delete-item-btn danger" data-id="${item.id}">Видалити</button>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
        } else {
             cartItemsContainer.innerHTML = `<p>${response.data.message || 'Ваш кошик порожній.'}</p>`;
             placeOrderBtn.style.display = 'none';
             clearCartBtn.style.display = 'none';
        }
    };
    
    cartItemsContainer.addEventListener('change', async (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const cartItemId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value);
            const response = await apiRequest(`/cart/${cartItemId}`, 'PUT', { quantity: newQuantity });
            if (!response.success) {
                showMessage('Не вдалося оновити кількість.', true);
                loadCart(); // Відновити
            }
        }
    });

    cartItemsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-item-btn')) {
            const cartItemId = e.target.dataset.id;
            const response = await apiRequest(`/cart/${cartItemId}`, 'DELETE');
            if (response.success) {
                showMessage('Товар видалено з кошика.');
                loadCart();
            } else {
                showMessage('Не вдалося видалити товар.', true);
            }
        }
    });

    clearCartBtn.addEventListener('click', async () => {
        if (confirm('Очистити весь кошик?')) {
            const response = await apiRequest('/cart', 'DELETE');
            if (response.success) {
                showMessage('Кошик очищено.');
                loadCart();
            } else {
                showMessage('Помилка.', true);
            }
        }
    });

    placeOrderBtn.addEventListener('click', async () => {
        const response = await apiRequest('/orders', 'POST');
        if (response.success) {
            showMessage('Замовлення успішно оформлено!');
            setTimeout(() => window.location.href = '/orders.html', 1500);
        } else {
            showMessage(response.data.message || 'Не вдалося оформити замовлення.', true);
        }
    });

    loadCart();
});