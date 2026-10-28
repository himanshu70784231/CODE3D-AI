/**
 * Unit & Integration Test Suite for Predict & Repair Challenge Feature
 */

import assert from 'node:assert';
import test from 'node:test';

import {
  PREDICT_CHALLENGES,
  REPAIR_CHALLENGES,
} from '../src/features/challenges/data/challengeData.js';

import {
  normalizeOutput,
  validatePrediction,
  validateRepairResults,
} from '../src/features/challenges/services/challengeValidator.js';

import {
  executeProgram,
  runTestCase,
  runAllTestCases,
} from '../src/features/challenges/services/challengeRunner.js';

test('Predict & Repair Challenge Feature Test Suite', async (t) => {
  await t.test('1. Challenge Catalog Data Invariance', () => {
    assert.ok(PREDICT_CHALLENGES.length >= 6, 'Must have at least 6 predict challenges');
    assert.ok(REPAIR_CHALLENGES.length >= 6, 'Must have at least 6 repair challenges');

    // Verify all Predict challenges have valid structures
    for (const c of PREDICT_CHALLENGES) {
      assert.ok(c.id, `Challenge must have an id: ${JSON.stringify(c)}`);
      assert.ok(c.title, `Challenge ${c.id} must have title`);
      assert.ok(c.code && c.code.trim().length > 0, `Challenge ${c.id} must have code`);
      assert.ok(c.expectedOutput !== undefined, `Challenge ${c.id} must have expectedOutput`);
      assert.ok(c.options && c.options.length === 4, `Challenge ${c.id} must have 4 options`);
      assert.ok(c.correctOptionIndex >= 0 && c.correctOptionIndex <= 3, `Challenge ${c.id} option index valid`);
      assert.ok(c.explanation, `Challenge ${c.id} must have explanation`);
    }

    // Verify all Repair challenges have valid structures
    for (const c of REPAIR_CHALLENGES) {
      assert.ok(c.id, `Repair challenge must have an id: ${JSON.stringify(c)}`);
      assert.ok(c.title, `Repair challenge ${c.id} must have title`);
      assert.ok(c.buggyCode, `Repair challenge ${c.id} must have buggyCode`);
      assert.ok(c.solutionCode, `Repair challenge ${c.id} must have solutionCode`);
      assert.ok(c.testCases && c.testCases.length >= 2, `Repair challenge ${c.id} must have >= 2 testCases`);
      assert.ok(c.bugType, `Repair challenge ${c.id} must have bugType`);
    }
  });

  await t.test('2. Validator: Output Normalization & Prediction Comparison', () => {
    // Normalization
    assert.strictEqual(normalizeOutput('  hello \r\nworld  '), 'hello \nworld');
    assert.strictEqual(normalizeOutput('42\n'), '42');
    assert.strictEqual(normalizeOutput(null), '');

    // Multiple Choice mode validation
    const optPass = validatePrediction({
      selectedOptionIndex: 1,
      correctOptionIndex: 1,
      mode: 'option',
    });
    assert.strictEqual(optPass.isCorrect, true);
    assert.strictEqual(optPass.matchPercentage, 100);

    const optFail = validatePrediction({
      selectedOptionIndex: 0,
      correctOptionIndex: 2,
      mode: 'option',
    });
    assert.strictEqual(optFail.isCorrect, false);
    assert.strictEqual(optFail.matchPercentage, 0);

    // Direct text mode validation
    const directPass = validatePrediction({
      userOutput: '10',
      expectedOutput: '10',
      mode: 'direct',
    });
    assert.strictEqual(directPass.isCorrect, true);
    assert.strictEqual(directPass.matchPercentage, 100);

    const directMultiLine = validatePrediction({
      userOutput: 'line1\nwrong',
      expectedOutput: 'line1\nline2',
      mode: 'direct',
    });
    assert.strictEqual(directMultiLine.isCorrect, false);
    assert.strictEqual(directMultiLine.matchPercentage, 50);
    assert.strictEqual(directMultiLine.diff.length, 2);
    assert.strictEqual(directMultiLine.diff[0].isMatch, true);
    assert.strictEqual(directMultiLine.diff[1].isMatch, false);
  });

  await t.test('3. Validator: Repair Test Suite Summary', () => {
    const mockResults = [
      { id: 1, passed: true },
      { id: 2, passed: true },
      { id: 3, passed: false },
    ];

    const val = validateRepairResults(mockResults);
    assert.strictEqual(val.allPassed, false);
    assert.strictEqual(val.passedCount, 2);
    assert.strictEqual(val.totalCount, 3);
    assert.strictEqual(val.failedCount, 1);
    assert.strictEqual(val.percentage, 67);

    const allPass = validateRepairResults([
      { id: 1, passed: true },
      { id: 2, passed: true },
    ]);
    assert.strictEqual(allPass.allPassed, true);
    assert.strictEqual(allPass.passedCount, 2);
  });

  await t.test('4. Runner: Real Sandboxed JavaScript Execution & Stdout Capture', async () => {
    const jsCode = `
      let x = 10;
      let y = 20;
      console.log(x + y);
    `;

    const res = await executeProgram({ code: jsCode, language: 'javascript' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.output, '30');
    assert.strictEqual(res.executionMode, 'local_sandbox');
    assert.ok(res.durationMs >= 0);
  });

  await t.test('5. Runner: Infinite Loop Detection & Guard Clamping', async () => {
    const infiniteCode = `
      let i = 0;
      while (i >= 0) {
        i++;
      }
      console.log(i);
    `;

    const res = await executeProgram({ code: infiniteCode, language: 'javascript' });
    assert.strictEqual(res.success, false);
    assert.ok(
      res.error.message.includes('Infinite loop detected') ||
      res.error.message.includes('Time Limit Exceeded'),
      `Expected loop guard error, got: ${res.error.message}`
    );
  });

  await t.test('6. Runner: Repair Challenge Solution Verification', async () => {
    const challenge = REPAIR_CHALLENGES.find((c) => c.id === 'repair-off-by-one');
    assert.ok(challenge, 'repair-off-by-one must exist');

    // 1. Run buggy code -> must fail
    const buggyRun = await runAllTestCases(
      challenge.buggyCode,
      challenge.language,
      challenge.testCases
    );
    assert.strictEqual(buggyRun.allPassed, false, 'Buggy code must not pass test cases');

    // 2. Run solution code -> must pass all
    const solutionRun = await runAllTestCases(
      challenge.solutionCode,
      challenge.language,
      challenge.testCases
    );
    assert.strictEqual(solutionRun.allPassed, true, 'Solution code must pass all test cases');
    assert.strictEqual(solutionRun.passedCount, challenge.testCases.length);
  });
});
