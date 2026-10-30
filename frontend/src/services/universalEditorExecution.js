/** Normalize the execution API response for the Universal Editor UI. */
export function normalizeUniversalExecutionResult(result = {}) {
  const rawStatus = String(result.status || '').toUpperCase();
  const isExplicitSuccess =
    result.success === true ||
    rawStatus === 'SUCCESS' ||
    rawStatus === 'COMPLETED' ||
    rawStatus === 'OK';
  const isExplicitError =
    result.success === false ||
    rawStatus === 'ERROR' ||
    rawStatus === 'FAILED';

  const status = isExplicitSuccess && !isExplicitError ? 'COMPLETED' : (rawStatus || 'ERROR');
  const failed = !isExplicitSuccess || isExplicitError;

  // Extract stdout / output from multiple possible backend formats:
  // 1. result.output (array or string)
  // 2. result.stdout (string)
  // 3. steps with output (e.g. step with eventType === 'OUTPUT' or last step's output stream)
  let rawOutput = [];
  if (Array.isArray(result.output) && result.output.length > 0) {
    rawOutput = result.output;
  } else if (typeof result.stdout === 'string' && result.stdout.length > 0) {
    rawOutput = result.stdout.replace(/\r/g, '').split('\n');
  } else if (typeof result.output === 'string' && result.output.length > 0) {
    rawOutput = result.output.replace(/\r/g, '').split('\n');
  } else if (Array.isArray(result.steps) && result.steps.length > 0) {
    // Find output from the last step or steps containing output
    const stepWithOutput = [...result.steps].reverse().find(s => Array.isArray(s.output) && s.output.length > 0);
    if (stepWithOutput) {
      rawOutput = stepWithOutput.output;
    }
  }

  const output = rawOutput.map(String).filter((line, index, lines) => !(index === lines.length - 1 && line === ''));
  const executionTimeMs = result.executionTimeMs == null ? NaN : Number(result.executionTimeMs);
  const traceSupported = !failed && result.traceSupported === true;
  const errorDetails = [
    ...new Set(
      [result.error, result.message, result.stderr]
        .filter((value) => typeof value === 'string' && value.trim())
    ),
  ];

  return {
    status,
    output,
    error: failed ? (errorDetails.join('\n') || `Execution ${String(status).toLowerCase()}.`) : null,
    executionTimeMs: Number.isFinite(executionTimeMs) && executionTimeMs >= 0 ? executionTimeMs : null,
    traceSupported,
    traceMode: result.traceMode || (result.traceGeneric === true ? 'source-model' : (traceSupported ? 'pattern-model' : 'output-only')),
    traceReason: result.traceGeneric === true
      ? 'Only generic source-level events were detected; no reliable data-structure trace is available.'
      : result.traceReason || null,
    complexity: result.complexity && typeof result.complexity === 'object' ? result.complexity : null,
    // Provide steps whenever execution succeeded
    steps: !failed && Array.isArray(result.steps) ? result.steps : [],
  };
}
