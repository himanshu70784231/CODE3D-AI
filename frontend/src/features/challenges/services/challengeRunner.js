/**
 * CODE3D-AI: Challenge Execution Runner
 * 
 * Coordinates real execution for Predict and Repair challenges.
 * - Local sandboxed execution with loop guards and stdout capture
 * - Full trace generation for the 3D WebGL visualizer via ExecutionEngine
 * - Safe backend checking with environment guards
 */

import { executionEngine } from '../../../execution/ExecutionEngine.js';
import { detectDataStructure, detectAlgorithm } from '../../../dsa/index.js';

const MAX_ITERATIONS = 50000;
const TIMEOUT_MS = 2500;

/**
 * Instruments JavaScript code with loop guards to prevent browser lockup from infinite loops
 */
function instrumentLoopGuards(code) {
  // Guard while loops
  let instrumented = code.replace(
    /\b(while\s*\([^)]*\)\s*\{)/g,
    `$1 if (++__code3d_loop_guard > ${MAX_ITERATIONS}) throw new Error("Time Limit Exceeded: Infinite loop detected."); `
  );

  // Guard for loops
  instrumented = instrumented.replace(
    /\b(for\s*\([^)]*\)\s*\{)/g,
    `$1 if (++__code3d_loop_guard > ${MAX_ITERATIONS}) throw new Error("Time Limit Exceeded: Infinite loop detected."); `
  );

  return `let __code3d_loop_guard = 0;\n${instrumented}`;
}

/**
 * Safely executes JavaScript code in a sandboxed runner and captures stdout
 */
async function runSandboxedJavaScript(code) {
  const outputLines = [];
  const customConsole = {
    log: (...args) => {
      const line = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      outputLines.push(line);
    },
    error: (...args) => {
      const line = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      outputLines.push(`[error] ${line}`);
    },
    warn: (...args) => {
      const line = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      outputLines.push(`[warn] ${line}`);
    },
    info: (...args) => {
      const line = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      outputLines.push(line);
    },
  };

  const instrumented = instrumentLoopGuards(code);

  return new Promise((resolve) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        resolve({
          success: false,
          output: outputLines.join('\n'),
          outputLines,
          error: {
            message: 'Time Limit Exceeded: Execution took longer than 2.5s.',
            type: 'TimeoutError',
          },
        });
      }
    }, TIMEOUT_MS);

    try {
      const fn = new Function('console', instrumented);
      fn(customConsole);
      completed = true;
      clearTimeout(timer);
      resolve({
        success: true,
        output: outputLines.join('\n'),
        outputLines,
        error: null,
      });
    } catch (err) {
      completed = true;
      clearTimeout(timer);

      let errorLine = null;
      if (err.stack) {
        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (match) {
          errorLine = Math.max(1, parseInt(match[1], 10) - 1);
        }
      }

      resolve({
        success: false,
        output: outputLines.join('\n'),
        outputLines,
        error: {
          message: err.message || 'Execution error',
          line: errorLine,
          type: err.name || 'RuntimeError',
          stack: err.stack,
        },
      });
    }
  });
}

/**
 * Execute program code across supported languages
 */
export async function executeProgram({ code, language = 'javascript', input = '', archetype = null }) {
  const startTime = performance.now();

  // 1. Generate 3D Trace using ExecutionEngine
  let traceResult = null;
  try {
    traceResult = await executionEngine.execute(code, language, { input, archetype });
    if (traceResult && traceResult.steps && traceResult.steps.length > 0) {
      const sampleVars = traceResult.steps[traceResult.steps.length - 1]?.variables || {};
      const detectedDsa = detectDataStructure(sampleVars, code, archetype);
      const detectedAlgorithm = detectAlgorithm(code, traceResult.steps);

      traceResult.steps.forEach((step, idx) => {
        if (!step.dataStructureState || !step.dataStructureState.type) {
          step.dataStructureState = {
            type: detectedDsa || 'array',
            values: Array.isArray(step.variables?.arr) ? step.variables.arr : [],
            label: `Step ${idx + 1}`,
          };
        }
      });
      traceResult.detectedDsa = detectedDsa;
      traceResult.detectedAlgorithm = detectedAlgorithm;
    }
  } catch (err) {
    traceResult = { success: false, steps: [], error: { message: err.message } };
  }

  // 2. Real Output Capturing for JavaScript
  if (language === 'javascript') {
    const sandboxRes = await runSandboxedJavaScript(code);
    const durationMs = Math.round(performance.now() - startTime);

    return {
      success: sandboxRes.success,
      output: sandboxRes.output.trim(),
      outputLines: sandboxRes.outputLines,
      durationMs,
      trace: traceResult?.steps || [],
      error: sandboxRes.error,
      backendUsed: false,
      executionMode: 'local_sandbox',
    };
  }

  // 3. For Python and Java: extract deterministic outputs from trace or backend
  const durationMs = Math.round(performance.now() - startTime);

  // If in browser and backend might be reachable
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      const backendUrl =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
        'http://localhost:8080/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const resp = await fetch(`${backendUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input, archetype }),
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      if (resp && resp.ok) {
        const backendData = await resp.json();
        if (backendData && backendData.success) {
          const out = Array.isArray(backendData.output)
            ? backendData.output.join('\n')
            : String(backendData.output || '').trim();

          return {
            success: true,
            output: out,
            outputLines: out.split('\n'),
            durationMs,
            trace: backendData.steps || traceResult?.steps || [],
            error: null,
            backendUsed: true,
            executionMode: 'backend_remote',
          };
        }
      }
    } catch {
      // Backend unreachable, continue to AST simulator
    }
  }

  // Local AST simulation trace extraction
  if (traceResult && traceResult.success && traceResult.steps.length > 0) {
    const traceOutputs = [];
    traceResult.steps.forEach((s) => {
      if (s.outputLine !== undefined && s.outputLine !== null) {
        traceOutputs.push(String(s.outputLine));
      } else if (Array.isArray(s.output) && s.output.length > 0) {
        s.output.forEach((o) => {
          if (!traceOutputs.includes(String(o))) traceOutputs.push(String(o));
        });
      }
    });

    const outputStr = traceOutputs.join('\n').trim();
    return {
      success: true,
      output: outputStr,
      outputLines: traceOutputs,
      durationMs,
      trace: traceResult.steps,
      error: null,
      backendUsed: false,
      executionMode: 'ast_simulator',
    };
  }

  return {
    success: false,
    output: '',
    outputLines: [],
    durationMs,
    trace: [],
    error: traceResult?.error || {
      message: `Unable to compile ${language} code. Backend execution server is offline.`,
      line: 1,
    },
    backendUsed: false,
    executionMode: 'failed',
  };
}

/**
 * Runs a single test case for Repair mode
 */
export async function runTestCase(code, language, testCase) {
  let runnerCode = code;
  if (testCase.testRunnerCode) {
    // Strip trailing demonstration console.log call from user starter code
    const stripped = code.trim().replace(/\n\s*console\.log\([^\n]+\);?\s*$/g, '');
    runnerCode = `${stripped}\n\n${testCase.testRunnerCode}`;
  }

  const execResult = await executeProgram({
    code: runnerCode,
    language,
    input: testCase.input || '',
  });

  const normalizedActual = (execResult.output || '').trim().replace(/\r\n/g, '\n');
  const normalizedExpected = (testCase.expectedOutput || '').trim().replace(/\r\n/g, '\n');

  const actualLines = normalizedActual.split('\n').map((l) => l.trim()).filter(Boolean);
  const expectedLines = normalizedExpected.split('\n').map((l) => l.trim()).filter(Boolean);

  const exactMatch = normalizedActual === normalizedExpected;
  const lastLineMatch =
    actualLines.length > 0 &&
    expectedLines.length === 1 &&
    actualLines[actualLines.length - 1] === expectedLines[0];

  const passed = Boolean(execResult.success && (exactMatch || lastLineMatch));

  return {
    id: testCase.id,
    name: testCase.name,
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    actualOutput: execResult.output,
    passed,
    isHidden: Boolean(testCase.isHidden),
    durationMs: execResult.durationMs,
    error: execResult.error,
    trace: execResult.trace,
  };
}

/**
 * Runs all test cases sequentially for a repair challenge
 */
export async function runAllTestCases(code, language, testCases) {
  const results = [];
  let lastTrace = [];
  let syntaxError = null;

  for (const tc of testCases) {
    const tcResult = await runTestCase(code, language, tc);
    results.push(tcResult);
    if (tcResult.trace && tcResult.trace.length > 0) {
      lastTrace = tcResult.trace;
    }
    if (tcResult.error && !syntaxError) {
      syntaxError = tcResult.error;
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === testCases.length;

  return {
    allPassed,
    passedCount,
    totalCount: testCases.length,
    results,
    lastTrace,
    syntaxError,
  };
}

export default {
  executeProgram,
  runTestCase,
  runAllTestCases,
};
