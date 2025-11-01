document.addEventListener("DOMContentLoaded", () => {
    // Перевірка токену на всіх сторінках, крім логіну
    if (window.location.pathname !== '/login.html' && !localStorage.getItem('access_token')) {
        window.location.href = '/login.html';
        return;
    }
    
    // Рендер хедера на всіх сторінках, де є placeholder
    if (document.getElementById('header-placeholder')) {
        renderHeader();
    }
});

async function renderHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    const response = await apiRequest('/user');
    const username = response.success ? response.data.username : 'Гість';

    headerPlaceholder.innerHTML = `
        <nav>
            <div class="nav-main">
                <a href="/index.html">Головна</a>
                <a href="/test-cases.html" class="${path.includes('test-case') ? 'active' : ''}">Тест кейси</a>
                <a href="#">Баг репорти</a>
                <a href="#">AI Асистент</a>
            </div>
            <div class="nav-right">
                <div class="user-menu-trigger" id="user-menu-trigger">
                    <span>Вітаю, ${username}</span>
                </div>
                <div class="dropdown-menu" id="dropdown-menu">
                    <a href="/profile.html">Профіль</a>
                    <button id="logout-btn">Вийти</button>
                </div>
            </div>
        </nav>
    `;

    // Логіка випадаючого меню
    const trigger = document.getElementById('user-menu-trigger');
    const menu = document.getElementById('dropdown-menu');
    trigger.addEventListener('click', () => {
        menu.classList.toggle('show');
    });

    // Закриття меню при кліку поза ним
    window.addEventListener('click', (event) => {
        if (!trigger.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('show');
        }
    });
    
    // Логіка виходу
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await apiRequest('/logout', 'POST');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login.html';
    });
}