document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const testCaseId = urlParams.get('id');

    if (!testCaseId) {
        window.location.href = '/test-cases.html';
        return;
    }

    document.getElementById('edit-btn').href = `/edit-test-case.html?id=${testCaseId}`;

    const response = await apiRequest(`/test-cases/${testCaseId}`);
    if (response.success) {
        const tc = response.data;
        document.getElementById('tc-title').textContent = tc.title;
        document.getElementById('tc-given-id').textContent = tc.given_id;
        document.getElementById('tc-priority').textContent = tc.priority;
        document.getElementById('tc-version').textContent = tc.version;
        document.getElementById('tc-environment').textContent = tc.environment;
        document.getElementById('tc-description').textContent = tc.description;
        document.getElementById('tc-preconditions').textContent = tc.preconditions || 'Немає';
        document.getElementById('tc-postconditions').textContent = tc.postconditions || 'Немає';
        document.getElementById('tc-comments').textContent = tc.comments || 'Немає';
        
        // Рендер кроків
        const stepsContainer = document.getElementById('steps-container');
        stepsContainer.innerHTML = '';
        if (tc.steps && tc.steps.length > 0) {
            const table = document.createElement('table');
            table.innerHTML = `<thead><tr><th>#</th><th>Дія</th><th>Тестові дані</th><th>Очікуваний результат</th></tr></thead>`;
            const tbody = document.createElement('tbody');
            tc.steps.sort((a, b) => a.number - b.number).forEach(step => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${step.number}</td>
                    <td>${step.step_name}</td>
                    <td>${step.test_data || ''}</td>
                    <td>${step.expected_result}</td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            stepsContainer.appendChild(table);
        } else {
            stepsContainer.innerHTML = '<p>Кроки не визначено.</p>';
        }

    } else {
        document.getElementById('tc-title').textContent = 'Помилка';
        document.querySelector('.container').innerHTML += '<p>Не вдалося завантажити тест-кейс. Можливо, у вас немає доступу.</p>';
    }
});