// Comprehensive Live API Verification Script
const BASE_URL = 'http://localhost:8080/api';

async function runTests() {
  console.log('Testing live Spring Boot APIs at:', BASE_URL);

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`  ✔ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✘ FAIL: ${name}:`, err.message);
      failed++;
    }
  }

  // 1. DSA Catalog
  await check('GET /dsa returns catalog', async () => {
    const res = await fetch(`${BASE_URL}/dsa`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid DSA response');
    }
  });

  // 2. Auth Register
  const testUser = `eng_${Date.now()}`;
  await check('POST /auth/register creates user with BCrypt hash', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser,
        email: `${testUser}@code3d.io`,
        password: 'securePassword123!',
        fullName: 'Lead Engineer',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error(data.message || 'Register failed');
    }
  });

  // 3. Auth Duplicate Email Conflict
  await check('POST /auth/register rejects duplicate email with 409', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `${testUser}_dup`,
        email: `${testUser}@code3d.io`,
        password: 'securePassword123!',
      }),
    });
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${res.status}`);
    }
  });

  // 4. Auth Login
  await check('POST /auth/login validates credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser,
        password: 'securePassword123!',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error(data.message || 'Login failed');
    }
  });

  // 5. Auth Me
  await check('GET /auth/me returns current user profile', async () => {
    const res = await fetch(`${BASE_URL}/auth/me?username=${testUser}`);
    const data = await res.json();
    if (!data.success || !data.user || data.user.username !== testUser) {
      throw new Error('Auth me profile mismatch');
    }
  });

  // 6. Execute Custom Java Program (Section 5)
  await check('POST /execute runs custom Java code and returns execution trace', async () => {
    const javaCode = `
      import java.util.Scanner;
      public class StudentResult {
        public static void main(String[] args) {
          int java = 85;
          int python = 90;
          int total = java + python;
          double percentage = total / 2.0;
          System.out.println("Total: " + total);
          System.out.println("Percentage: " + percentage);
        }
      }
    `;
    const res = await fetch(`${BASE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: javaCode,
        language: 'java',
        title: 'StudentResult Run',
      }),
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error(data.error || 'Execution failed or empty steps');
    }
    const lastStep = data.steps[data.steps.length - 1];
    if (!lastStep.output || !lastStep.output.some(o => o.includes('175'))) {
      throw new Error('Expected output containing 175 not found in trace');
    }
  });

  // 7. Executions History
  await check('GET /executions and POST /executions record history', async () => {
    const postRes = await fetch(`${BASE_URL}/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programTitle: 'Verification Run',
        language: 'java',
        totalSteps: 12,
        status: 'COMPLETED',
      }),
    });
    const postData = await postRes.json();
    if (!postData.success) throw new Error('Create execution failed');

    const getRes = await fetch(`${BASE_URL}/executions`);
    const getData = await getRes.json();
    if (!getData.success || !Array.isArray(getData.data)) {
      throw new Error('Get executions failed');
    }
  });

  // 8. Saved Programs
  let savedId = null;
  await check('POST /programs and GET /programs save and list programs', async () => {
    const postRes = await fetch(`${BASE_URL}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Binary Search Implementation',
        description: 'Optimal search in O(log n)',
        code: 'int mid = low + (high - low) / 2;',
        language: 'java',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      }),
    });
    const postData = await postRes.json();
    if (!postData.success || !postData.data?.id) throw new Error('Create program failed');
    savedId = postData.data.id;

    const getRes = await fetch(`${BASE_URL}/programs`);
    const getData = await getRes.json();
    if (!getData.success || !Array.isArray(getData.data)) {
      throw new Error('Get programs failed');
    }
  });

  // 9. Update & Delete Saved Program
  await check('PUT and DELETE /programs/:id manage saved programs', async () => {
    const putRes = await fetch(`${BASE_URL}/programs/${savedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Binary Search Implementation',
      }),
    });
    const putData = await putRes.json();
    if (!putData.success) throw new Error('Update program failed');

    const delRes = await fetch(`${BASE_URL}/programs/${savedId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Delete program failed');
  });

  // 10. AI Explanation (Section 33)
  await check('POST /ai/explain generates context-aware tutor guidance', async () => {
    const res = await fetch(`${BASE_URL}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'int[] arr = {10, 20, 30}; int x = arr[i];',
        language: 'java',
        lineNumber: 2,
        queryType: 'EXPLAIN_LINE',
        level: 'Intermediate',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.explanation) {
      throw new Error('AI explanation failed');
    }
  });

  // 11. Quiz Questions and Submission (Section 34)
  await check('GET /quiz and POST /quiz/submit record quiz assessment', async () => {
    const qRes = await fetch(`${BASE_URL}/quiz?conceptId=bst`);
    const qData = await qRes.json();
    if (!qData.success || !Array.isArray(qData.data) || qData.data.length === 0) {
      throw new Error('Fetch quiz failed');
    }

    const subRes = await fetch(`${BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conceptId: 'bst',
        score: 4,
        totalQuestions: 4,
      }),
    });
    const subData = await subRes.json();
    if (!subData.success) throw new Error('Quiz submit failed');
  });

  // 12. User Profile (Section 39)
  await check('GET and PUT /profile manage user profiles', async () => {
    const getRes = await fetch(`${BASE_URL}/profile?username=${testUser}`);
    const getData = await getRes.json();
    if (!getData.success || !getData.data) throw new Error('Get profile failed');

    const putRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser,
        fullName: 'Principal Architect & Engineer',
      }),
    });
    const putData = await putRes.json();
    if (!putData.success || putData.data.fullName !== 'Principal Architect & Engineer') {
      throw new Error('Update profile failed');
    }
  });

  // 13. Settings (Section 35)
  await check('GET and PUT /settings manage application configuration', async () => {
    const getRes = await fetch(`${BASE_URL}/settings`);
    const getData = await getRes.json();
    if (!getData.success || !getData.data) throw new Error('Get settings failed');

    const putRes = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        editorFontSize: 16,
        theme: 'dark',
      }),
    });
    const putData = await putRes.json();
    if (!putData.success || putData.data.editorFontSize !== 16) {
      throw new Error('Update settings failed');
    }
  });

  console.log(`\nResults: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests.`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
