import assert from 'node:assert';
import test from 'node:test';

import { validateSourceCode } from '../src/services/codeValidator.js';
import { TraceBuilder } from '../src/execution/TraceBuilder.js';
import { validateExecutionStep, validateTrace } from '../src/execution/TraceValidator.js';
import { detectDataStructure, detectAlgorithm } from '../src/dsa/index.js';
import { getExecutionTrace } from '../src/services/executionSimulator.js';
import { DsaStructureType, DsaAlgorithmType } from '../src/dsa/models/types.js';

test('Frontend Execution & Validation Suite', async (t) => {
  await t.test('1. Syntax Validation: Delimiter & Structural Balance', () => {
    // Valid Java code
    const validJava = 'int[] arr = {1, 2, 3};\nint sum = 0;\nfor (int i = 0; i < arr.length; i++) {\n  sum += arr[i];\n}';
    assert.strictEqual(validateSourceCode(validJava, 'java').isValid, true);

    // Mismatched bracket
    const mismatchedBracket = 'int[] arr = [1, 2, 3};';
    const resMismatched = validateSourceCode(mismatchedBracket, 'java');
    assert.strictEqual(resMismatched.isValid, false);
    assert.ok(resMismatched.error.message.includes('Mismatched') || resMismatched.error.message.includes('closing'));

    // Unterminated quote
    const unclosedString = 'String s = "unclosed;\nint x = 10;';
    const resQuote = validateSourceCode(unclosedString, 'java');
    assert.strictEqual(resQuote.isValid, false);

    // Python missing colon
    const pythonNoColon = 'def solve()\n  return 42';
    const resPy = validateSourceCode(pythonNoColon, 'python');
    assert.strictEqual(resPy.isValid, false);
    assert.ok(resPy.error.message.includes("':'"));

    // Empty code
    const emptyRes = validateSourceCode('', 'java');
    assert.strictEqual(emptyRes.isValid, false);
    assert.ok(emptyRes.error.message.includes('empty'));
  });

  await t.test('2. TraceBuilder: Normalization & Sequencing', () => {
    const builder = new TraceBuilder('javascript');
    builder.addStep({
      lineNumber: 1,
      eventType: 'PROGRAM_START',
      variables: {},
      output: [],
    });
    builder.addStep({
      lineNumber: 2,
      eventType: 'VARIABLE_DECLARATION',
      variables: { arr: [10, 20, 30] },
      dataStructureState: { type: 'array', values: [10, 20, 30] },
      output: [],
    });
    builder.addStep({
      lineNumber: 3,
      eventType: 'PROGRAM_END',
      variables: { arr: [10, 20, 30] },
      output: ['Done'],
    });

    const steps = builder.getSteps();
    assert.strictEqual(steps.length, 3);
    assert.strictEqual(steps[0].stepNumber, 1);
    assert.strictEqual(steps[1].stepNumber, 2);
    assert.strictEqual(steps[2].stepNumber, 3);
    assert.strictEqual(steps[1].eventType, 'VARIABLE_DECLARATION');
  });

  await t.test('3. TraceValidator: Schema Validation', () => {
    const validStep = {
      stepId: 'step-1',
      stepNumber: 1,
      lineNumber: 10,
      eventType: 'ARRAY_ACCESS',
      variables: { i: 2 },
      callStack: [],
      dataStructures: [],
    };
    const validRes = validateExecutionStep(validStep, 0);
    assert.strictEqual(validRes.valid, true);

    const invalidStep = {
      // Missing stepNumber and lineNumber
      eventType: 'ARRAY_ACCESS',
    };
    const invalidRes = validateExecutionStep(invalidStep, 0);
    assert.strictEqual(invalidRes.valid, false);
    assert.ok(invalidRes.error);
  });

  await t.test('4. DSA Detector: Structure Inference', () => {
    // Array
    const arrayDsa = detectDataStructure({ arr: [1, 2, 3] }, 'int[] arr = {1,2,3};');
    assert.strictEqual(arrayDsa, DsaStructureType.ARRAY);

    // Matrix
    const matrixDsa = detectDataStructure({ matrix: [[1, 2], [3, 4]] }, 'int[][] matrix = {{1,2},{3,4}};');
    assert.strictEqual(matrixDsa, DsaStructureType.MATRIX);

    // Linked List
    const llDsa = detectDataStructure({ head: { val: 1, next: null } }, 'ListNode head = new ListNode(1);');
    assert.strictEqual(llDsa, DsaStructureType.LINKED_LIST);

    // Tree
    const treeDsa = detectDataStructure({ root: { val: 10, left: null, right: null } }, 'TreeNode root = new TreeNode(10);');
    assert.strictEqual(treeDsa, DsaStructureType.BINARY_TREE);

    // Stack
    const stackDsa = detectDataStructure({}, 'Stack<Integer> stack = new Stack<>();');
    assert.strictEqual(stackDsa, DsaStructureType.STACK);

    // Queue
    const queueDsa = detectDataStructure({}, 'Queue<Integer> q = new LinkedList<>();');
    assert.strictEqual(queueDsa, DsaStructureType.QUEUE);
  });

  await t.test('5. Algorithm Detector: Pattern Recognition', () => {
    // Binary Search
    const bsCode = 'int low = 0, high = n - 1;\nwhile (low <= high) {\n  int mid = (low + high) / 2;\n}';
    const detectedBs = detectAlgorithm(bsCode, []);
    assert.strictEqual(detectedBs, DsaAlgorithmType.BINARY_SEARCH);

    // Bubble Sort
    const sortCode = 'void bubbleSort(int[] arr) {\n  for(int i=0; i<n; i++) {\n    for(int j=0; j<n-i-1; j++) {\n      if(arr[j] > arr[j+1]) swap(arr[j], arr[j+1]);\n    }\n  }\n}';
    const detectedSort = detectAlgorithm(sortCode, []);
    assert.strictEqual(detectedSort, DsaAlgorithmType.BUBBLE_SORT);

    // Two Pointers
    const twoPtrCode = 'int left = 0, right = n - 1;\nwhile (left < right) {\n  left++; right--;\n}';
    const detectedTwoPtr = detectAlgorithm(twoPtrCode, []);
    assert.strictEqual(detectedTwoPtr, DsaAlgorithmType.TWO_POINTERS);
  });

  await t.test('6. Data Structure Models: Schema & Enums', () => {
    assert.ok(DsaStructureType.ARRAY);
    assert.ok(DsaStructureType.LINKED_LIST);
    assert.ok(DsaStructureType.STACK);
    assert.ok(DsaStructureType.QUEUE);
    assert.ok(DsaStructureType.BINARY_TREE);
    assert.ok(DsaStructureType.GRAPH);
    assert.ok(DsaStructureType.MATRIX);
    assert.ok(DsaAlgorithmType.BINARY_SEARCH);
    assert.ok(DsaAlgorithmType.BUBBLE_SORT);
  });

  await t.test('7. Edge Cases Simulation: Arrays', () => {
    // Single element array
    const singleTrace = getExecutionTrace('int[] arr = {42};', 'java');
    assert.ok(singleTrace && singleTrace.length > 0);

    // Negative numbers and duplicates
    const negTrace = getExecutionTrace('int[] arr = {-10, 0, 10, -10};', 'java');
    assert.ok(negTrace && negTrace.length > 0);
  });

  await t.test('8. Deterministic arrayLoopTrace: Index Guards and Completeness', async () => {
    const { generateArrayLoopTrace } = await import('../src/engine/arrayLoopTrace.js');
    const values = [5, 15, 25];
    const steps = generateArrayLoopTrace(values);

    assert.ok(Array.isArray(steps));
    assert.ok(steps.length > 0);

    // Verify index bounds for every step
    steps.forEach((s, idx) => {
      assert.strictEqual(s.stepNumber, idx + 1);
      assert.ok(typeof s.lineNumber === 'number' && s.lineNumber > 0);
      if (s.dataStructureState?.activeIndex !== null && s.dataStructureState?.activeIndex !== undefined) {
        assert.ok(s.dataStructureState.activeIndex >= 0);
        assert.ok(s.dataStructureState.activeIndex < values.length);
      }
    });

    // Empty array fallback
    const emptySteps = generateArrayLoopTrace([]);
    assert.ok(Array.isArray(emptySteps) && emptySteps.length > 0);
  });

  await t.test('9. Execution Clamping: Strict Out-of-Bounds Guards', () => {
    const clampIndex = (idx, len) => {
      if (typeof idx !== 'number' || Number.isNaN(idx)) return 0;
      if (len <= 0) return 0;
      return Math.max(0, Math.min(Math.floor(idx), len - 1));
    };

    const totalSteps = 10;
    // Scrubbing beyond bounds
    assert.strictEqual(clampIndex(-5, totalSteps), 0);
    assert.strictEqual(clampIndex(-1, totalSteps), 0);
    assert.strictEqual(clampIndex(0, totalSteps), 0);
    assert.strictEqual(clampIndex(5, totalSteps), 5);
    assert.strictEqual(clampIndex(9, totalSteps), 9);
    assert.strictEqual(clampIndex(10, totalSteps), 9);
    assert.strictEqual(clampIndex(999, totalSteps), 9);

    // Empty trace edge case
    assert.strictEqual(clampIndex(5, 0), 0);
    assert.strictEqual(clampIndex(-1, 0), 0);

    // Non-number handling
    assert.strictEqual(clampIndex(NaN, totalSteps), 0);
    assert.strictEqual(clampIndex(undefined, totalSteps), 0);
  });

  await t.test('10. Multi-Language Templates & Starter Code Retrieval', async () => {
    const { getAlgorithmCode, MULTI_LANG_TEMPLATES } = await import('../src/utils/multiLanguageTemplates.js');
    const languages = ['java', 'python', 'cpp', 'c', 'javascript'];

    for (const lang of languages) {
      const bubbleCode = getAlgorithmCode('bubble-sort', lang);
      assert.ok(bubbleCode && bubbleCode.length > 20, `Bubble sort code exists for ${lang}`);

      const arrayCode = getAlgorithmCode('array-loop', lang);
      assert.ok(arrayCode && arrayCode.length > 20, `Array loop code exists for ${lang}`);

      const bsCode = getAlgorithmCode('binary-search', lang);
      assert.ok(bsCode && bsCode.length > 20, `Binary search code exists for ${lang}`);
    }
  });

  await t.test('11. Master Algorithm Catalog Trace Synthesis', async () => {
    const {
      generateBubbleSortSteps,
      generateSelectionSortSteps,
      generateInsertionSortSteps,
      generateMergeSortSteps,
      generateQuickSortSteps,
      generateLinearSearchSteps,
      generateBinarySearchSteps,
      generateStackSteps,
      generateQueueSteps,
      generateBstSteps,
      generateHeapSteps,
    } = await import('../src/algorithms/index.js');

    const getStepsArray = (res) => (Array.isArray(res) ? res : (res?.steps || []));

    // Test sorting on reversed array
    const revArr = [50, 40, 30, 20, 10];
    const bubbleSteps = getStepsArray(generateBubbleSortSteps(revArr));
    assert.ok(bubbleSteps.length > 5, 'Bubble sort generates steps on reversed array');

    const mergeSteps = getStepsArray(generateMergeSortSteps([38, 27, 43, 3, 9]));
    assert.ok(mergeSteps.length > 3, 'Merge sort generates steps');

    const quickSteps = getStepsArray(generateQuickSortSteps([10, 80, 30, 90, 40]));
    assert.ok(quickSteps.length > 3, 'Quick sort generates steps');

    // Searching
    const linSteps = getStepsArray(generateLinearSearchSteps([10, 20, 30], 20));
    assert.ok(linSteps.length > 0, 'Linear search generates steps');

    const binSteps = getStepsArray(generateBinarySearchSteps([10, 20, 30, 40, 50], 30));
    assert.ok(binSteps.length > 0, 'Binary search generates steps');

    // Data structure operations
    const stackSteps = getStepsArray(generateStackSteps([5, 10, 15]));
    assert.ok(stackSteps.length > 0, 'Stack operations trace generated');

    const queueSteps = getStepsArray(generateQueueSteps([1, 2, 3]));
    assert.ok(queueSteps.length > 0, 'Queue operations trace generated');

    const bstSteps = getStepsArray(generateBstSteps([50, 30, 70, 20]));
    assert.ok(bstSteps.length > 0, 'BST trace generated');

    const heapSteps = getStepsArray(generateHeapSteps([20, 15, 30, 10]));
    assert.ok(heapSteps.length > 0, 'Heap trace generated');
  });

  await t.test('12. Trace Normalization Schema Invariance', async () => {
    const { normalizeTrace, normalizeExecutionStep } = await import('../src/features/execution/normalizeTrace.js');

    const rawSteps = [
      { step: 1, line: 2, eventType: 'COMPARE', variables: { i: 0, j: 1 }, dataStructure: { type: 'array', values: [1, 2] } },
      { step: 2, line: 3, eventType: 'SWAP', variables: { i: 0, j: 1 }, dataStructure: { type: 'array', values: [2, 1] } },
    ];

    const normalized = normalizeTrace(rawSteps);
    assert.strictEqual(normalized.length, 2);
    assert.strictEqual(normalized[0].operation, 'COMPARE');
    assert.strictEqual(normalized[1].operation, 'SWAP');
    assert.ok(normalized[0].dataStructureState);
    assert.deepStrictEqual(normalized[0].dataStructureState.values, [1, 2]);
    assert.deepStrictEqual(normalized[1].dataStructureState.values, [2, 1]);
  });

  await t.test('13. Algorithm Detection & Invariant Edge Cases', () => {
    // Already sorted array
    const sortedTrace = getExecutionTrace('int[] arr = {1, 2, 3, 4, 5};', 'java');
    assert.ok(sortedTrace && sortedTrace.length > 0);

    // Array with all duplicates
    const dupTrace = getExecutionTrace('int[] arr = {7, 7, 7, 7};', 'java');
    assert.ok(dupTrace && dupTrace.length > 0);
  });
});

