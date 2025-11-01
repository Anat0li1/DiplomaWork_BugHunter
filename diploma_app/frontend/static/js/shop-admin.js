// Функція для перемикання табів
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Загальні налаштування та елементи ---
    const messageArea = document.getElementById('message-area');
    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message-toast ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
        setTimeout(() => messageArea.style.display = 'none', 3000);
    };

    // --- Логіка перемикання ролі ---
    const roleSwitchBtn = document.getElementById('role-switch-btn');
    roleSwitchBtn.addEventListener('click', async () => {
        const response = await apiRequest('/change_role', 'POST');
        if (response.success) {
            showMessage('Роль змінено. Перенаправляємо до каталогу...');
            setTimeout(() => window.location.href = '/storefront.html', 1000);
        } else {
            showMessage('Не вдалося змінити роль.', true);
        }
    });

    // --- Логіка керування інформацією про магазин ---
    const shopForm = document.getElementById('shop-form');
    const deleteShopBtn = document.getElementById('delete-shop-btn');
    const shopNameInput = document.getElementById('shop-name-input');
    const shopDescriptionInput = document.getElementById('shop-description-input');
    
    async function loadShopInfo() {
        const response = await apiRequest('/store');
        if (response.success) {
            document.getElementById('admin-shop-name').textContent = response.data.name;
            shopNameInput.value = response.data.name;
            shopDescriptionInput.value = response.data.description;
        } else {
            showMessage("Не вдалося завантажити інформацію про магазин.", true);
            // Якщо магазину немає, перенаправляємо на сторінку створення
            if (response.status === 404) {
                 window.location.href = '/create-shop.html';
            }
        }
    }

    shopForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const response = await apiRequest('/store', 'PUT', {
            name: shopNameInput.value,
            description: shopDescriptionInput.value,
        });
        if (response.success) {
            showMessage('Інформацію про магазин оновлено.');
            loadShopInfo(); // Оновити заголовок сторінки
        } else {
            showMessage(response.data.message || 'Помилка оновлення.', true);
        }
    });

    deleteShopBtn.addEventListener('click', async () => {
        if (confirm('Ви впевнені? Видалення магазину - незворотня дія!')) {
            const response = await apiRequest('/store', 'DELETE');
            if (response.success) {
                alert('Магазин видалено. Вас буде повернено на головну сторінку.');
                window.location.href = '/index.html';
            } else {
                showMessage(response.data.message || 'Помилка видалення.', true);
            }
        }
    });

    // --- Логіка керування товарами ---
    const productForm = document.getElementById('product-form');
    const productsTableBody = document.querySelector('#products-table tbody');
    const productSearchInput = document.getElementById('product-search');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productDescInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productQuantityInput = document.getElementById('product-quantity');

    let allProducts = []; // Кешуємо товари для пошуку

    const renderProducts = (products) => {
        productsTableBody.innerHTML = '';
        if (products.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="4">Товари не знайдено.</td></tr>';
            return;
        }
        products.forEach(product => {
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
    };

    const loadProducts = async () => {
        const response = await apiRequest('/store/products');
        if (response.success) {
            allProducts = response.data;
            renderProducts(allProducts);
        } else if (response.status !== 404) {
            showMessage(response.data.message || 'Не вдалося завантажити товари.', true);
        }
    };
    
    productSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
        renderProducts(filteredProducts);
    });

    const resetProductForm = () => {
        productForm.reset();
        productIdInput.value = '';
        cancelEditBtn.style.display = 'none';
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
            showMessage(productId ? 'Товар оновлено!' : 'Товар створено!');
            resetProductForm();
            loadProducts();
        } else {
            showMessage(response.data.message || 'Сталася помилка.', true);
        }
    });

    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('edit-btn')) {
            const productId = target.dataset.id;
            const product = allProducts.find(p => p.id == productId);
            if (product) {
                productIdInput.value = product.id;
                productNameInput.value = product.name;
                productDescInput.value = product.description;
                productPriceInput.value = product.price;
                productQuantityInput.value = product.quantity;
                cancelEditBtn.style.display = 'inline-block';
                window.scrollTo(0, 0);
            }
        }
        if (target.classList.contains('delete-btn')) {
            const productId = target.dataset.id;
            if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
                const response = await apiRequest(`/shop/products/${productId}`, 'DELETE');
                if (response.success) {
                    showMessage('Товар видалено.');
                    loadProducts();
                } else {
                    showMessage(response.data.message || 'Не вдалося видалити товар.', true);
                }
            }
        }
    });

    cancelEditBtn.addEventListener('click', resetProductForm);

    // --- Початкове завантаження даних ---
    loadShopInfo();
    loadProducts();
});