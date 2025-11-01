document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('test-case-form');
    const stepsEditor = document.getElementById('steps-editor');
    const addStepBtn = document.getElementById('add-step-btn');
    const pageTitle = document.getElementById('page-title');
    const messageArea = document.getElementById('message-area');
    
    const urlParams = new URLSearchParams(window.location.search);
    const testCaseId = urlParams.get('id');
    const isEditMode = !!testCaseId;

    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `message-toast ${isError ? 'error' : 'success'}`;
        messageArea.style.display = 'block';
        setTimeout(() => messageArea.style.display = 'none', 3000);
    };

    const renumberSteps = () => {
        const steps = stepsEditor.querySelectorAll('.step-row');
        steps.forEach((step, index) => {
            step.querySelector('.step-number').textContent = index + 1;
        });
    };

    const addStep = (stepData = {}) => {
        const stepRow = document.createElement('div');
        stepRow.className = 'step-row';
        const stepNumber = stepsEditor.children.length + 1;

        stepRow.innerHTML = `
            <div class="step-header">
                <strong class="step-number">${stepNumber}</strong>
                <button type="button" class="delete-step-btn danger">Видалити крок</button>
            </div>
            <textarea class="step_name" placeholder="Дія" required>${stepData.step_name || ''}</textarea>
            <textarea class="test_data" placeholder="Тестові дані">${stepData.test_data || ''}</textarea>
            <textarea class="expected_result" placeholder="Очікуваний результат" required>${stepData.expected_result || ''}</textarea>
        `;
        stepsEditor.appendChild(stepRow);
    };

    addStepBtn.addEventListener('click', () => addStep());

    stepsEditor.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-step-btn')) {
            e.target.closest('.step-row').remove();
            renumberSteps();
        }
    });

    const loadTestCaseData = async () => {
        pageTitle.textContent = 'Редагування тест-кейсу';
        const response = await apiRequest(`/test-cases/${testCaseId}`);
        if (response.success) {
            const tc = response.data;
            document.getElementById('title').value = tc.title;
            document.getElementById('given_id').value = tc.given_id;
            document.getElementById('application_group').value = tc.application_group || '';
            document.getElementById('priority').value = tc.priority;
            document.getElementById('version').value = tc.version;
            document.getElementById('environment').value = tc.environment;
            document.getElementById('description').value = tc.description;
            document.getElementById('preconditions').value = tc.preconditions || '';
            document.getElementById('postconditions').value = tc.postconditions || '';
            document.getElementById('comments').value = tc.comments || '';

            tc.steps.sort((a, b) => a.number - b.number).forEach(step => addStep(step));
        } else {
            showMessage('Не вдалося завантажити дані тест-кейсу.', true);
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const steps = [];
        document.querySelectorAll('.step-row').forEach((row, index) => {
            steps.push({
                number: index + 1,
                step_name: row.querySelector('.step_name').value,
                test_data: row.querySelector('.test_data').value,
                expected_result: row.querySelector('.expected_result').value
            });
        });

        if (steps.length === 0) {
            showMessage('Тест-кейс повинен мати хоча б один крок.', true);
            return;
        }

        const testCaseData = {
            title: document.getElementById('title').value,
            given_id: parseInt(document.getElementById('given_id').value),
            application_group: document.getElementById('application_group').value,
            priority: parseInt(document.getElementById('priority').value),
            version: document.getElementById('version').value,
            environment: document.getElementById('environment').value,
            description: document.getElementById('description').value,
            preconditions: document.getElementById('preconditions').value,
            postconditions: document.getElementById('postconditions').value,
            comments: document.getElementById('comments').value,
            steps: steps
        };

        const method = isEditMode ? 'PUT' : 'POST';
        const endpoint = isEditMode ? `/test-cases/${testCaseId}` : '/test-cases';

        const response = await apiRequest(endpoint, method, testCaseData);
        if (response.success) {
            showMessage('Тест-кейс успішно збережено!');
            setTimeout(() => {
                window.location.href = `/view-test-case.html?id=${response.data.id}`;
            }, 1000);
        } else {
            showMessage(response.data.message || 'Помилка збереження.', true);
        }
    });

    if (isEditMode) {
        loadTestCaseData();
    } else {
        addStep();
    }
});