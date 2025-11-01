async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    let response = await fetch(endpoint, config);

    // Логіка оновлення токена
    if (response.status === 401) {
        console.log('Access token expired or invalid. Trying to refresh...');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            // Якщо немає рефреш токена, перенаправляємо на логін
            window.location.href = '/login.html';
            return { success: false, data: { message: 'Authentication required.' } };
        }

        const refreshResponse = await fetch('/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
            },
        });

        if (refreshResponse.ok) {
            const { access_token } = await refreshResponse.json();
            localStorage.setItem('access_token', access_token);
            console.log('Token refreshed successfully. Retrying original request...');
            // Повторюємо оригінальний запит з новим токеном
            headers['Authorization'] = `Bearer ${access_token}`;
            config.headers = headers;
            response = await fetch(endpoint, config);
        } else {
            console.log('Failed to refresh token. Redirecting to login.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login.html';
            return { success: false, data: { message: 'Session expired.' } };
        }
    }
    
    const data = await response.json().catch(() => ({})); // Handle empty responses (like 204)
    
    return {
        success: response.ok,
        status: response.status,
        data,
    };
}