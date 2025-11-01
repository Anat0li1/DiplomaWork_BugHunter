document.addEventListener('DOMContentLoaded', async () => {
    const actionCard = document.getElementById('main-action-card');
    const title = document.getElementById('action-card-title');
    const description = document.getElementById('action-card-description');

    const response = await apiRequest('/store');
    
    if (response.success) {
        // Якщо магазин існує
        title.textContent = "Керувати магазином";
        description.textContent = "Перейдіть до панелі керування вашим магазином, додавайте товари та слідкуйте за продажами.";
        actionCard.href = '/shop-admin.html';
    } else if (response.status === 404) {
        // Якщо магазину немає
        title.textContent = "Створити свій магазин";
        description.textContent = "Почніть свій бізнес вже сьогодні. Створіть власний онлайн-магазин за кілька простих кроків.";
        actionCard.href = '/create-shop.html';
    } else {
        // У випадку іншої помилки
        title.textContent = "Щось пішло не так";
        description.textContent = "Не вдалося завантажити інформацію. Спробуйте оновити сторінку.";
        actionCard.href = '#';
    }
});