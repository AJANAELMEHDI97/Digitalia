(async () => {
  try {
    const loginRes = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test+api2@example.com', password: 'Test1234!' }),
    });

    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      process.exit(2);
    }

    const loginBody = await loginRes.json();
    const token = loginBody.token;
    if (!token) {
      console.error('No token returned from login');
      process.exit(2);
    }

    const res = await fetch('http://localhost:4000/admin/logs', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error('Admin logs fetch failed:', await res.text());
      process.exit(2);
    }

    const body = await res.json();
    if (!Array.isArray(body)) {
      console.error('Unexpected admin logs response:', body);
      process.exit(2);
    }

    console.log('Admin logs OK. Count:', body.length);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
