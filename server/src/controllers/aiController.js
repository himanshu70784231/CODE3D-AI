/**
 * CODE3D-AI - AI Algorithmic Tutor Controller (Feature 4)
 * 
 * Contextual explanation engine for execution steps, code, errors, algorithms, and complexity.
 * Private API keys remain strictly server-side.
 * Explanations are grounded in the supplied code and verified execution trace.
 * Clearly distinguishes verified execution results from AI pedagogical inferences.
 */

export async function explainContext(req, res) {
  try {
    const {
      action = 'Explain Step',
      code = '',
      language = 'java',
      lineNumber = null,
      currentStep = null,
      variables = {},
      callStack = [],
      condition = null,
      dataStructureState = null,
      dsaType = 'array',
      error = null,
      question = null,
      prompt: reqPrompt = null,
    } = req.body;

    const userQuestion = question || reqPrompt;
    const apiKey = process.env.AI_API_KEY || null;
    const isStepExplanation = action === 'Explain Step' || action === 'explain-step';
    const isVerifiedTrace = Boolean(currentStep && currentStep.stepNumber);

    // Context summary constructed from verified execution data
    const executionContextSummary = {
      isVerifiedTrace,
      stepNumber: currentStep?.stepNumber || 1,
      activeLine: lineNumber || currentStep?.lineNumber || 1,
      variablesState: currentStep?.variables || variables || {},
      changedVariable: currentStep?.changedVariable || null,
      evaluatedCondition: currentStep?.condition || condition || null,
      stackFrames: currentStep?.callStack || callStack || ['main'],
      dataStructure: currentStep?.dataStructureState || dataStructureState || { type: dsaType },
      stdout: currentStep?.output || [],
    };

    if (apiKey) {
      try {
        const promptText = userQuestion
          ? `You are the CODE3D-AI Educational Computer Science & DSA Tutor.
Context:
- Programming Language: ${language}
- Source Code:
\`\`\`${language}
${code}
\`\`\`
- Active Line: ${executionContextSummary.activeLine}
- Active Memory Variables: ${JSON.stringify(executionContextSummary.variablesState)}
- Call Stack: ${JSON.stringify(executionContextSummary.stackFrames)}
- Condition Result: ${JSON.stringify(executionContextSummary.evaluatedCondition)}
- Data Structure State: ${JSON.stringify(executionContextSummary.dataStructure)}
- User Question: "${userQuestion}"

Rules:
1. Ground your answer in the actual code and execution trace state above.
2. Provide a clear, pedagogical explanation.
3. If discussing complexity, specify both Time and Auxiliary Space complexity in Big-O notation.
4. Distinguish what is directly observed in memory vs algorithmic principles.`
          : `You are the CODE3D-AI Educational Computer Science Tutor.
Action: ${action}
- Language: ${language}
- Line Number: ${executionContextSummary.activeLine}
- Active Code Line: ${(code.split('\n')[executionContextSummary.activeLine - 1] || '').trim()}
- State Variables: ${JSON.stringify(executionContextSummary.variablesState)}
- Mutated Variable: ${executionContextSummary.changedVariable || 'None'}
- Condition Evaluated: ${JSON.stringify(executionContextSummary.evaluatedCondition)}
- Data Structure: ${JSON.stringify(executionContextSummary.dataStructure)}
- Error (if any): ${error || 'None'}

Provide a crystal-clear 2-3 paragraph pedagogical explanation of what happens at this execution step in memory and in the 3D visualization.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.35 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (explanation) {
            return res.json({
              success: true,
              action,
              explanation,
              answer: explanation,
              isVerifiedTrace,
              context: executionContextSummary,
              source: 'AI_MODEL',
            });
          }
        }
      } catch (aiErr) {
        console.warn('AI Tutor upstream notice, using built-in reasoning engine:', aiErr.message);
      }
    }

    // Built-in Deterministic Algorithmic Tutor Reasoning Engine
    let explanation = '';
    const cleanCode = (code || '').toLowerCase();
    const hasLoops = cleanCode.includes('for') || cleanCode.includes('while');
    const hasNestedLoops = (cleanCode.match(/for|while/g) || []).length >= 2;
    const isRecursion = cleanCode.includes('return') && cleanCode.includes('(') && executionContextSummary.stackFrames.length > 1;

    let timeComp = hasNestedLoops ? 'O(n²)' : hasLoops ? 'O(n)' : 'O(1)';
    let spaceComp = isRecursion ? 'O(n)' : 'O(1)';

    if (userQuestion) {
      if (/complex|time|space|big-o/i.test(userQuestion)) {
        explanation = `Complexity Analysis:
• Time Complexity: ${timeComp} — ${hasNestedLoops ? 'Two nested loops iterate over the data structure.' : hasLoops ? 'A single linear traversal touches each element once.' : 'Direct arithmetic/constant operations.'}
• Auxiliary Space Complexity: ${spaceComp} — ${isRecursion ? 'Call stack depth grows with recursive subproblems.' : 'State is maintained in-place with scalar stack variables without heap reallocation.'}`;
      } else if (/edge|bound|null|empty/i.test(userQuestion)) {
        explanation = `Defensive Edge Case Analysis:
1. Null / Empty Checks: Ensure collection length > 0 before indexing.
2. Single Element: Verify that loop invariants terminate immediately when n = 1.
3. Boundary Guards: Array indexing in Java is strictly 0 to (n - 1). Accessing index n throws ArrayIndexOutOfBoundsException.`;
      } else if (/hint|debug|stuck/i.test(userQuestion)) {
        explanation = `Debugging Guidance & Invariant Check:
• Inspect variable '${executionContextSummary.changedVariable || 'state'}': Currently holding ${JSON.stringify(executionContextSummary.variablesState)}.
• Check loop termination condition: Ensure the loop index increments monotonically towards the upper bound.
• Trace memory pointers: Verify that pointer movements correspond to expected array cells.`;
      } else {
        explanation = `Algorithmic Breakdown:
The program operates on language '${language}' at line ${executionContextSummary.activeLine}.
Active variables: ${Object.entries(executionContextSummary.variablesState).map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join(', ') || 'None'}.
Memory model: ${executionContextSummary.isVerifiedTrace ? 'Directly verified from execution step trace.' : 'Inferred from static source structure.'}`;
      }
    } else {
      // Step explanation
      const activeLineCode = (code.split('\n')[executionContextSummary.activeLine - 1] || '').trim();
      const condInfo = executionContextSummary.evaluatedCondition
        ? ` Condition (${executionContextSummary.evaluatedCondition.expression || 'check'}) evaluated to ${executionContextSummary.evaluatedCondition.result}.`
        : '';
      const varInfo = executionContextSummary.changedVariable
        ? ` Variable '${executionContextSummary.changedVariable}' updated to ${JSON.stringify(executionContextSummary.variablesState[executionContextSummary.changedVariable])}.`
        : '';

      explanation = `Step ${executionContextSummary.stepNumber} (Line ${executionContextSummary.activeLine}):
"${activeLineCode}"
${varInfo}${condInfo}
In the 3D scene, this corresponds to active highlight on memory location, reflecting real runtime state.`;
    }

    return res.json({
      success: true,
      action,
      explanation,
      answer: explanation,
      isVerifiedTrace,
      complexity: { time: timeComp, space: spaceComp },
      context: executionContextSummary,
      source: 'BUILTIN_ENGINE',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'TUTOR_ERROR', message: err.message || 'AI explanation error.' },
    });
  }
}
