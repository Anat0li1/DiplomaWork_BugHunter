document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputs = form.querySelectorAll('input');
    const data = {};
    inputs.forEach(input => {
      data[input.name] = input.value;
    });

    const isLogin = window.location.pathname.includes('login');
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem('token', result.access_token);
        window.location.href = '/dashboard.html';
      } else {
        alert(result.message || 'Error during request');
      }
    } catch (err) {
      console.error(err);
      alert('Request failed. Check console.');
    }
  });
});

async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
