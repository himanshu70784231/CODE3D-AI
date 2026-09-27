import { executeCodeInSandbox } from '../sandbox/executionEngine.js';
import { getPrisma, isDbOnline } from '../db.js';

export const memoryExecutions = [];

export async function runExecution(req, res) {
  try {
    const { code, language = 'java', input = '', title = 'Custom Execution' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Code is required.',
      });
    }

    const execResult = await executeCodeInSandbox({ code, language, input });

    // Persist to database if user is logged in
    const userId = req.user?.id || null;
    let savedRecord = null;

    if (isDbOnline() && execResult.status === 'COMPLETED') {
      try {
        const prisma = getPrisma();
        savedRecord = await prisma.algorithmExecution.create({
          data: {
            userId,
            title,
            language,
            code,
            input,
            status: 'COMPLETED',
            stepCount: execResult.totalSteps,
            executionTimeMs: execResult.executionTimeMs,
            traceJson: execResult.steps,
          },
        });
      } catch (dbErr) {
        console.warn('Could not persist execution to database:', dbErr.message);
      }
    } else if (execResult.status === 'COMPLETED') {
      // Memory store fallback
      savedRecord = {
        id: `exec-${Date.now()}`,
        userId,
        title,
        language,
        code,
        input,
        status: 'COMPLETED',
        stepCount: execResult.totalSteps,
        executionTimeMs: execResult.executionTimeMs,
        traceJson: execResult.steps,
        createdAt: new Date(),
      };
      memoryExecutions.unshift(savedRecord);
      if (memoryExecutions.length > 50) memoryExecutions.pop();
    }

    return res.json({
      success: execResult.status === 'COMPLETED',
      executionId: savedRecord?.id || execResult.executionId,
      language: execResult.language,
      status: execResult.status,
      errorCode: execResult.errorCode || null,
      message: execResult.message || null,
      steps: execResult.steps,
      totalSteps: execResult.totalSteps,
      finalVariables: execResult.finalVariables,
      output: execResult.output,
      executionTimeMs: execResult.executionTimeMs,
      complexity: execResult.complexity,
    });
  } catch (err) {
    console.error('Execution controller error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to complete execution.',
    });
  }
}

export function analyzeCode(req, res) {
  try {
    const { code = '', language = 'java' } = req.body;
    let loopNesting = 0;
    let maxNesting = 0;
    const lines = code.split('\n');
    for (const line of lines) {
      if (/\b(for|while)\b/.test(line)) {
        loopNesting++;
        if (loopNesting > maxNesting) maxNesting = loopNesting;
      }
      if (line.includes('}')) {
        loopNesting = Math.max(0, loopNesting - 1);
      }
    }
    const timeComplexity = maxNesting === 0 ? 'O(1)' : maxNesting === 1 ? 'O(n)' : maxNesting === 2 ? 'O(n²)' : `O(n^${maxNesting})`;
    const spaceComplexity = /\b(new\s+[a-zA-Z0-9_]+\[|vector<|list\(|\[\])/.test(code) ? 'O(n)' : 'O(1)';

    return res.json({
      success: true,
      timeComplexity,
      spaceComplexity,
      maxLoopNesting: maxNesting,
      language,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Analysis error' });
  }
}

