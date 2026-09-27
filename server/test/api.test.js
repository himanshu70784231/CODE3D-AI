import assert from 'node:assert';
import test from 'node:test';
import app from '../src/app.js';

// Simple lightweight HTTP request helper for testing express app without external dependencies
async function request(path, options = {}) {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://localhost:${port}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    const cookie = res.headers.get('set-cookie');
    return { status: res.status, data, cookie };
  } finally {
    server.close();
  }
}

test('API Endpoints Test Suite', async (t) => {
  await t.test('GET /api/health returns online status', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.status === 'ok' || res.data.status === 'online');
    assert.strictEqual(res.data.supportedLanguages.length, 5);
  });

  let sessionCookie = '';

  await t.test('POST /api/auth/register creates user and returns session', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: `tester_${Date.now()}`,
        email: `tester_${Date.now()}@code3d.io`,
        password: 'password123',
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.sessionToken);
    sessionCookie = res.cookie ? res.cookie.split(';')[0] : '';
  });

  await t.test('POST /api/executions/run executes custom code', async () => {
    const res = await request('/api/executions/run', {
      method: 'POST',
      body: {
        code: 'int sum = 0;\nfor(int i = 1; i <= 5; i++) { sum += i; }',
        language: 'java',
        title: 'Java Test',
      },
      headers: sessionCookie ? { Cookie: sessionCookie } : {},
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.status, 'COMPLETED');
    assert.strictEqual(res.data.finalVariables.sum, 15);
  });

  await t.test('GET /api/dsa/topics returns topics list', async () => {
    const res = await request('/api/dsa/topics');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.topics));
  });

  await t.test('GET /api/dsa/problems returns seeded problems', async () => {
    const res = await request('/api/dsa/problems');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.problems));
  });

  await t.test('GET /api/dashboard/stats returns real counters', async () => {
    const res = await request('/api/dashboard/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(typeof res.data.stats.totalExecutions === 'number');
  });
});
