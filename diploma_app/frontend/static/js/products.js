document.addEventListener('DOMContentLoaded', () => {
    // Універсальна кнопка виходу
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login.html';
    });

    const productForm = document.getElementById('product-form');
    const productsTableBody = document.querySelector('#products-table tbody');
    const messageArea = document.getElementById('message-area');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productDescInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productQuantityInput = document.getElementById('product-quantity');

    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
        setTimeout(() => messageArea.style.display = 'none', 3000);
    };

    const resetForm = () => {
        productForm.reset();
        productIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    };

    const loadProducts = async () => {
        const response = await apiRequest('/store/products');
        productsTableBody.innerHTML = ''; // Очистити таблицю перед заповненням
        
        if (response.success) {
            if (response.data.length === 0) {
                 productsTableBody.innerHTML = '<tr><td colspan="4">У вашому магазині ще немає продуктів.</td></tr>';
                 return;
            }
            response.data.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>${product.quantity}</td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${product.id}">Редагувати</button>
                        <button class="delete-btn danger" data-id="${product.id}">Видалити</button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });
        } else if(response.status !== 404) { // 404 може означати, що магазин ще не створений
            showMessage(response.data.message || 'Не вдалося завантажити продукти.', true);
        }
    };

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productData = {
            name: productNameInput.value,
            description: productDescInput.value,
            price: parseFloat(productPriceInput.value),
            quantity: parseInt(productQuantityInput.value),
        };

        const productId = productIdInput.value;
        const method = productId ? 'PUT' : 'POST';
        const endpoint = productId ? `/shop/products/${productId}` : '/store/products';

        const response = await apiRequest(endpoint, method, productData);

        if (response.success) {
            showMessage(productId ? 'Продукт оновлено!' : 'Продукт створено!', false);
            resetForm();
            await loadProducts();
        } else {
            showMessage(response.data.message || 'Сталася помилка.', true);
        }
    });

    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const productId = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Ви впевнені, що хочете видалити цей продукт?')) {
                const response = await apiRequest(`/shop/products/${productId}`, 'DELETE');
                if (response.success) {
                    showMessage('Продукт видалено.', false);
                    await loadProducts();
                } else {
                    showMessage(response.data.message || 'Не вдалося видалити продукт.', true);
                }
            }
        }

        if (target.classList.contains('edit-btn')) {
            const response = await apiRequest(`/shop/products/${productId}`);
            if (response.success) {
                const product = response.data;
                productIdInput.value = product.id;
                productNameInput.value = product.name;
                productDescInput.value = product.description;
                productPriceInput.value = product.price;
                productQuantityInput.value = product.quantity;
                cancelEditBtn.style.display = 'inline-block';
                window.scrollTo(0, 0); // Прокрутити сторінку вгору до форми
            } else {
                showMessage('Не вдалося завантажити дані продукту для редагування.', true);
            }
        }
    });
    
    cancelEditBtn.addEventListener('click', resetForm);

    loadProducts();
});