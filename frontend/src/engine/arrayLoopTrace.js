/**
 * CODE3D-AI - Deterministic Array Loop Trace Generator
 * 
 * Provides deterministic execution steps for 1D array loop traversal.
 * Strictly guarantees valid index boundaries and safe data structure states.
 */

export function generateArrayLoopTrace(inputValues = [10, 20, 30, 40]) {
  const values = Array.isArray(inputValues) && inputValues.length > 0
    ? [...inputValues]
    : [10, 20, 30, 40];
  
  const n = values.length;
  const steps = [];
  const output = [];
  let step = 1;

  const createArrayState = (vals, activeIdx, label, focusInfo) => ({
    type: 'array',
    name: 'arr',
    values: [...vals],
    activeIndex: activeIdx,
    pointers: activeIdx !== null && activeIdx !== undefined ? { i: activeIdx } : {},
    label,
    focusInfo,
  });

  // Step 1: Array Allocation
  steps.push({
    stepNumber: step++,
    lineNumber: 4,
    eventType: 'ARRAY_CREATION',
    variables: { arr: [...values] },
    changedVariable: 'arr',
    currentValue: [...values],
    output: [...output],
    dataStructureState: createArrayState(values, null, 'Array Initialized', `Memory allocated for ${n} elements.`),
    explanation: `Memory allocated for integer array 'arr' of size ${n}: [${values.join(', ')}]`,
    aiHint: 'Arrays occupy contiguous memory blocks with 0-based indexing.',
  });

  // Step 2: Loop Init
  steps.push({
    stepNumber: step++,
    lineNumber: 6,
    eventType: 'LOOP_INIT',
    variables: { arr: [...values], i: 0 },
    changedVariable: 'i',
    currentValue: 0,
    output: [...output],
    dataStructureState: createArrayState(values, 0, 'Loop Initialized', 'i = 0'),
    explanation: "Loop initialized: Counter variable 'i' is declared and set to 0.",
    aiHint: 'Counter i starts at index 0.',
  });

  // Loop iterations
  for (let i = 0; i < n; i++) {
    // Condition Check (True)
    steps.push({
      stepNumber: step++,
      lineNumber: 6,
      eventType: 'CONDITION_CHECK',
      variables: { arr: [...values], i },
      condition: {
        expression: 'i < arr.length',
        evaluation: `${i} < ${n}`,
        result: true,
        branch: 'ENTER LOOP BODY',
      },
      output: [...output],
      dataStructureState: createArrayState(values, i, `Condition True (${i} < ${n})`, `Accessing index ${i}`),
      explanation: `Condition 'i < arr.length' (${i} < ${n}) is TRUE. Executing loop body for index ${i}.`,
      aiHint: `i = ${i} is safely within range [0..${n - 1}].`,
    });

    // Array Access & Print
    const val = values[i];
    output.push(String(val));
    steps.push({
      stepNumber: step++,
      lineNumber: 7,
      eventType: 'ARRAY_ACCESS',
      variables: { arr: [...values], i, 'arr[i]': val },
      changedVariable: 'arr[i]',
      currentValue: val,
      output: [...output],
      dataStructureState: createArrayState(values, i, `Read arr[${i}] = ${val}`, `Element at index ${i} is ${val}`),
      explanation: `Reading element arr[${i}] = ${val}. Printing value to stdout.`,
      aiHint: `Direct O(1) memory access at physical index ${i}.`,
    });

    // Loop Increment
    steps.push({
      stepNumber: step++,
      lineNumber: 6,
      eventType: 'LOOP_STEP',
      variables: { arr: [...values], i: i + 1 },
      changedVariable: 'i',
      currentValue: i + 1,
      output: [...output],
      dataStructureState: createArrayState(values, Math.min(i + 1, n - 1), `Increment i (${i} -> ${i + 1})`, `Next i = ${i + 1}`),
      explanation: `Incremented loop counter 'i' from ${i} to ${i + 1}.`,
      aiHint: 'Loop step operation i++ evaluates at the end of each iteration.',
    });
  }

  // Loop Termination Condition (False)
  steps.push({
    stepNumber: step++,
    lineNumber: 6,
    eventType: 'CONDITION_CHECK',
    variables: { arr: [...values], i: n },
    condition: {
      expression: 'i < arr.length',
      evaluation: `${n} < ${n}`,
      result: false,
      branch: 'EXIT LOOP',
    },
    output: [...output],
    dataStructureState: createArrayState(values, null, `Condition False (${n} < ${n})`, 'Loop Terminated'),
    explanation: `Condition 'i < arr.length' (${n} < ${n}) is FALSE. Exiting for-loop.`,
    aiHint: 'Loop terminates because counter i reached array length.',
  });

  // Completion
  steps.push({
    stepNumber: step++,
    lineNumber: 9,
    eventType: 'PROGRAM_COMPLETION',
    variables: { arr: [...values], i: n },
    output: [...output],
    dataStructureState: createArrayState(values, null, 'Execution Completed', `Total steps executed: ${step - 1}`),
    explanation: `Program execution finished successfully. Output: [${output.join(', ')}]`,
    aiHint: 'Time Complexity: O(n), Space Complexity: O(1).',
  });

  return steps;
}

export default generateArrayLoopTrace;
