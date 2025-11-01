document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#test-cases-table tbody');
    const groupsContainer = document.getElementById('groups-container');
    let activeGroup = null;

    const renderTable = (testCases) => {
        tableBody.innerHTML = '';
        if (!testCases || testCases.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Тест-кейси не знайдено.</td></tr>';
            return;
        }
        testCases.forEach(tc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tc.given_id}</td>
                <td>${tc.title}</td>
                <td>${tc.is_system ? 'Системний' : 'Користувацький'}</td>
                <td>${tc.priority}</td>
                <td class="actions">
                    <a href="/view-test-case.html?id=${tc.id}" class="action-btn">Перегляд</a>
                    ${!tc.is_system ? `<a href="/edit-test-case.html?id=${tc.id}" class="action-btn">Редагувати</a>` : ''}
                    ${!tc.is_system ? `<button class="action-btn danger delete-btn" data-id="${tc.id}">Видалити</button>` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const loadTestCases = async (group = null) => {
        const endpoint = group ? `/test-cases?group=${group}` : '/test-cases';
        const response = await apiRequest(endpoint);
        if (response.success) {
            renderTable(response.data);
        } else {
            tableBody.innerHTML = '<tr><td colspan="5">Помилка завантаження тест-кейсів.</td></tr>';
        }
    };

    const loadGroups = async () => {
        const response = await apiRequest('/test-case-groups');
        if (response.success && response.data.length > 0) {
            groupsContainer.innerHTML = '<button class="group-btn active" data-group="all">Всі</button>';
            response.data.forEach(group => {
                const btn = document.createElement('button');
                btn.className = 'group-btn';
                btn.textContent = group;
                btn.dataset.group = group;
                groupsContainer.appendChild(btn);
            });
        }
    };

    groupsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('.group-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            const group = e.target.dataset.group;
            activeGroup = group === 'all' ? null : group;
            loadTestCases(activeGroup);
        }
    });

    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const tcId = e.target.dataset.id;
            if (confirm('Ви впевнені, що хочете видалити цей тест-кейс?')) {
                const response = await apiRequest(`/test-cases/${tcId}`, 'DELETE');
                if (response.success) {
                    loadTestCases(activeGroup); // Перезавантажити список
                } else {
                    alert('Не вдалося видалити тест-кейс.');
                }
            }
        }
    });

    loadGroups();
    loadTestCases();
});