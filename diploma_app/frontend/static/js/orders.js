document.addEventListener('DOMContentLoaded', () => {
     // Універсальна кнопка виходу
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login.html';
    });
    
    const ordersListContainer = document.getElementById('orders-list');
    const messageArea = document.getElementById('message-area');

    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
    };

    const loadOrders = async () => {
        const response = await apiRequest('/orders');
        ordersListContainer.innerHTML = '';
        
        if (response.success) {
            const orders = response.data.orders;
            if (!orders || orders.length === 0) {
                ordersListContainer.innerHTML = '<p>У вас ще немає замовлень.</p>';
                return;
            }

            orders.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order-summary';
                
                let itemsHtml = '<ul>';
                order.items.forEach(item => {
                    itemsHtml += `<li>${item.product_name} - ${item.quantity} шт. x ${item.unit_price.toFixed(2)} грн</li>`;
                });
                itemsHtml += '</ul>';

                orderDiv.innerHTML = `
                    <h3>Замовлення №${order.id}</h3>
                    <p><strong>Дата:</strong> ${new Date(order.created_at).toLocaleString('uk-UA')}</p>
                    <p><strong>Сума:</strong> ${order.total_amount.toFixed(2)} грн</p>
                    <h4>Товари:</h4>
                    ${itemsHtml}
                `;
                ordersListContainer.appendChild(orderDiv);
            });
        } else {
             showMessage(response.data.message || 'Не вдалося завантажити замовлення.', true);
        }
    };

    loadOrders();
});