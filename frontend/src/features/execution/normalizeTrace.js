/**
 * CODE3D-AI - Normalized Execution State Pipeline
 * 
 * Compliant with Section 6 & 30 specification:
 * Bridges simulators (Java AST, Python, C++, Backend traces) into a uniform execution model.
 */

export function normalizeOperation(rawOp) {
  if (!rawOp) return 'EXECUTE';
  const op = String(rawOp).toUpperCase().replace(/[\s-]/g, '_');

  if (op.includes('COMPARE')) return 'COMPARE';
  if (op.includes('SWAP')) return 'SWAP';
  if (op.includes('ASSIGN')) return 'ASSIGNMENT';
  if (op.includes('DECLAR')) return 'DECLARATION';
  if (op.includes('ACCESS')) return 'ARRAY_ACCESS';
  if (op.includes('PUSH')) return 'STACK_PUSH';
  if (op.includes('POP')) return 'STACK_POP';
  if (op.includes('ENQUEUE')) return 'QUEUE_ENQUEUE';
  if (op.includes('DEQUEUE')) return 'QUEUE_DEQUEUE';
  if (op.includes('INSERT')) return 'INSERTION';
  if (op.includes('DELETE') || op.includes('REMOVE')) return 'DELETION';
  if (op.includes('VISIT')) return 'GRAPH_VISIT';
  if (op.includes('EDGE')) return 'GRAPH_EDGE';
  if (op.includes('RECURS') || op.includes('CALL')) return 'RECURSION_CALL';
  if (op.includes('RETURN')) return 'FUNCTION_RETURN';
  if (op.includes('LOOP_INIT')) return 'LOOP_INIT';
  if (op.includes('LOOP') || op.includes('ITERAT')) return 'LOOP_ITERATION';
  if (op.includes('CONDIT') || op.includes('CHECK')) return 'CONDITION_CHECK';
  if (op.includes('OUTPUT') || op.includes('PRINT')) return 'OUTPUT';
  if (op.includes('START')) return 'PROGRAM_START';
  if (op.includes('END')) return 'PROGRAM_END';

  return op;
}

export function normalizeDataStructure(ds, variables = {}) {
  if (!ds || typeof ds !== 'object') {
    // Attempt auto-detection from variables if no explicit DS
    for (const [key, val] of Object.entries(variables)) {
      if (Array.isArray(val)) {
        return {
          type: 'array',
          name: key,
          values: [...val],
          activeIndex: null,
          pointers: {},
        };
      }
    }
    return {
      type: 'universal',
      values: [],
      variables: { ...variables },
    };
  }

  const type = (ds.type || 'array').toLowerCase();
  const values = Array.isArray(ds.values) ? [...ds.values] : [];
  
  let activeIndex = ds.activeIndex ?? null;
  let activeElements = [];

  if (activeIndex !== null && activeIndex !== undefined) {
    activeElements.push(activeIndex);
  }
  if (ds.previousIndex !== null && ds.previousIndex !== undefined) {
    activeElements.push(ds.previousIndex);
  }
  if (Array.isArray(ds.comparedIndices)) {
    activeElements.push(...ds.comparedIndices);
  }
  if (Array.isArray(ds.activeElements)) {
    activeElements.push(...ds.activeElements);
  }

  return {
    type,
    name: ds.name || 'arr',
    values,
    activeIndex,
    previousIndex: ds.previousIndex ?? null,
    pointers: ds.pointers || {},
    nodes: Array.isArray(ds.nodes) ? ds.nodes : [],
    edges: Array.isArray(ds.edges) ? ds.edges : [],
    matrix: Array.isArray(ds.matrix) ? ds.matrix : [],
    activeElements: Array.from(new Set(activeElements)),
    label: ds.label || '',
    focusInfo: ds.focusInfo || '',
    variables: ds.variables || { ...variables },
  };
}

export function normalizeExecutionStep(rawStep, index = 0, defaultComplexity = { time: 'O(n)', space: 'O(1)' }) {
  if (!rawStep) return null;

  const stepNumber = rawStep.stepNumber || rawStep.step || index + 1;
  const lineNumber = rawStep.lineNumber || rawStep.line || 1;
  const operation = normalizeOperation(rawStep.eventType || rawStep.operation);
  const variables = rawStep.variables ? { ...rawStep.variables } : {};
  const dataStructure = normalizeDataStructure(rawStep.dataStructureState || rawStep.dataStructure, variables);

  const activeElements = dataStructure.activeElements || [];
  const explanation = rawStep.explanation || `Executing statement at line ${lineNumber}.`;
  
  let output = [];
  if (Array.isArray(rawStep.output)) {
    output = [...rawStep.output];
  } else if (rawStep.output !== undefined && rawStep.output !== null) {
    output = [String(rawStep.output)];
  }

  const callStack = Array.isArray(rawStep.callStack)
    ? [...rawStep.callStack]
    : [{ functionName: 'main', lineNumber }];

  const complexity = rawStep.complexity || defaultComplexity;

  const normalized = {
    id: `step-${stepNumber}`,
    step: stepNumber,
    stepNumber,
    lineNumber,
    operation,
    eventType: operation, // Compatibility
    variables,
    changedVariable: rawStep.changedVariable || null,
    previousValue: rawStep.previousValue ?? null,
    currentValue: rawStep.currentValue ?? null,
    condition: rawStep.condition || null,
    dataStructure,
    dataStructureState: dataStructure, // Compatibility for 3D visualizers
    activeElements,
    explanation,
    output,
    callStack,
    complexity,
    aiHint: rawStep.aiHint || '',
  };

  return normalized;
}

export function normalizeTrace(rawTrace, defaultComplexity = { time: 'O(n)', space: 'O(1)' }) {
  if (!Array.isArray(rawTrace) || rawTrace.length === 0) {
    return [];
  }
  return rawTrace.map((step, idx) => normalizeExecutionStep(step, idx, defaultComplexity));
}

export default normalizeTrace;
