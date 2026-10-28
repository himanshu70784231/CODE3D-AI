/**
 * CODE3D-AI: Challenge Validator Service
 * Validates prediction answers and repair test suite results with diff generation.
 */

/**
 * Normalizes output text by trimming leading/trailing whitespace and standardizing newlines
 */
export function normalizeOutput(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Validates user output prediction against expected output
 * @param {object} params
 * @param {string} [params.userOutput] - User-typed direct output
 * @param {string} params.expectedOutput - Actual expected output
 * @param {number} [params.selectedOptionIndex] - Chosen option index
 * @param {number} params.correctOptionIndex - Correct option index
 * @param {string} [params.mode] - 'option' | 'direct'
 * @returns {object} Validation result
 */
export function validatePrediction({
  userOutput = '',
  expectedOutput = '',
  selectedOptionIndex = null,
  correctOptionIndex = 0,
  mode = 'option',
}) {
  if (mode === 'option') {
    const isCorrect = selectedOptionIndex === correctOptionIndex;
    return {
      isCorrect,
      mode: 'option',
      selectedOptionIndex,
      correctOptionIndex,
      matchPercentage: isCorrect ? 100 : 0,
      diff: [],
      message: isCorrect
        ? 'Great job! Your prediction matches the program output exactly.'
        : 'Incorrect prediction. Study the code walkthrough and trace below to see where the divergence occurred.',
    };
  }

  // Direct Output Mode: Line-by-line diff comparison
  const normalizedUser = normalizeOutput(userOutput);
  const normalizedExpected = normalizeOutput(expectedOutput);

  const userLines = normalizedUser.length > 0 ? normalizedUser.split('\n') : [];
  const expectedLines = normalizedExpected.length > 0 ? normalizedExpected.split('\n') : [];

  const maxLines = Math.max(userLines.length, expectedLines.length);
  const diff = [];
  let matchingLines = 0;

  for (let i = 0; i < maxLines; i++) {
    const userLine = userLines[i] ?? '';
    const expLine = expectedLines[i] ?? '';
    const isMatch = userLine.trim() === expLine.trim();

    if (isMatch) matchingLines++;

    diff.push({
      lineNumber: i + 1,
      user: userLine,
      actual: expLine,
      isMatch,
    });
  }

  const matchPercentage = maxLines > 0 ? Math.round((matchingLines / maxLines) * 100) : 0;
  const isCorrect = normalizedUser === normalizedExpected;

  return {
    isCorrect,
    mode: 'direct',
    matchPercentage,
    diff,
    message: isCorrect
      ? 'Perfect match! You predicted the exact console output.'
      : matchPercentage > 50
      ? 'Close! Some lines matched, but check formatting or values on divergent lines.'
      : 'Output did not match. Inspect the step-by-step diff and 3D simulation.',
  };
}

/**
 * Validates a suite of test cases for code repair
 */
export function validateRepairResults(testCaseResults = []) {
  if (!testCaseResults || testCaseResults.length === 0) {
    return {
      allPassed: false,
      passedCount: 0,
      totalCount: 0,
      percentage: 0,
      summary: 'No test cases run.',
    };
  }

  const totalCount = testCaseResults.length;
  const passedCount = testCaseResults.filter((r) => r.passed).length;
  const failedCount = totalCount - passedCount;
  const percentage = Math.round((passedCount / totalCount) * 100);
  const allPassed = passedCount === totalCount;

  return {
    allPassed,
    passedCount,
    failedCount,
    totalCount,
    percentage,
    summary: allPassed
      ? `All ${totalCount} test cases passed successfully!`
      : `${passedCount} of ${totalCount} test cases passed. ${failedCount} failing.`,
  };
}

export default {
  normalizeOutput,
  validatePrediction,
  validateRepairResults,
};
