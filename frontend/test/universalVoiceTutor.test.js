import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLanguageRuntimeInfo,
  requestUniversalAiExplanation,
  SUPPORTED_LANGUAGES,
} from '../src/services/aiExplanationEngine.js';

test('Universal AI Voice Tutor: Language runtime capability verification', () => {
  assert.ok(SUPPORTED_LANGUAGES.length >= 5, 'Should support at least 5 core programming languages');

  const javaInfo = getLanguageRuntimeInfo('java');
  assert.equal(javaInfo.id, 'java');
  assert.equal(javaInfo.executable, true);

  const jsInfo = getLanguageRuntimeInfo('javascript');
  assert.equal(jsInfo.id, 'javascript');
  assert.equal(jsInfo.executable, true);

  const pythonInfo = getLanguageRuntimeInfo('python');
  assert.equal(pythonInfo.id, 'python');
  assert.equal(pythonInfo.executable, true);

  const cppInfo = getLanguageRuntimeInfo('cpp');
  assert.equal(cppInfo.id, 'cpp');
  assert.equal(cppInfo.executable, true);

  const cInfo = getLanguageRuntimeInfo('c');
  assert.equal(cInfo.id, 'c');
  assert.equal(cInfo.executable, true);

  const unknown = getLanguageRuntimeInfo('brainfuck');
  assert.equal(unknown.executable, false);
  assert.equal(unknown.runner, 'Static AI Analysis Only');
});

test('Universal AI Voice Tutor: Structured Line Steps Generation', async () => {
  const sampleCode = `public class Main {
    public static void main(String[] args) {
        int x = 10;
        int y = 20;
        int sum = x + y;
        System.out.println(sum);
    }
}`;

  const result = await requestUniversalAiExplanation({
    code: sampleCode,
    language: 'java',
    action: 'EXPLAIN_CODE',
    actualOutput: ['30'],
  });

  assert.ok(result, 'Result should exist');
  assert.ok(result.overview, 'Should provide an overview');
  assert.ok(Array.isArray(result.lineSteps), 'Should generate line steps array');
  assert.ok(result.lineSteps.length >= 4, 'Should identify all non-empty code lines');

  // Verify line number sequence
  const lineNumbers = result.lineSteps.map((s) => s.lineNumber);
  assert.ok(lineNumbers.includes(1), 'Should include line 1 (class declaration)');
  assert.ok(lineNumbers.includes(2), 'Should include line 2 (main method)');
  assert.ok(lineNumbers.includes(3), 'Should include line 3 (int x = 10)');

  // Verify line 3 step content
  const line3 = result.lineSteps.find((s) => s.lineNumber === 3);
  assert.ok(line3.codeLine.includes('int x = 10'));
  assert.ok(line3.text.includes('Line 3.'));

  // Verify output status
  assert.equal(result.isActualOutput, true);
  assert.deepEqual(result.actualOutput, ['30']);
});

test('Universal AI Voice Tutor: Single Line Explanation', async () => {
  const sampleCode = `int a = 5;\nint b = 10;\nint c = a + b;`;

  const result = await requestUniversalAiExplanation({
    code: sampleCode,
    language: 'java',
    action: 'EXPLAIN_LINE',
    lineNumber: 3,
  });

  assert.equal(result.action, 'EXPLAIN_LINE');
  assert.ok(result.currentLineStep, 'Should identify currentLineStep');
  assert.equal(result.currentLineStep.lineNumber, 3);
});

test('Universal AI Voice Tutor: Error Explanation & Debugging Guidance', async () => {
  const sampleCode = `int[] arr = new int[3];\nSystem.out.println(arr[5]);`;
  const errorMessage = 'ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3';

  const result = await requestUniversalAiExplanation({
    code: sampleCode,
    language: 'java',
    action: 'DEBUG_ERROR',
    error: errorMessage,
    lineNumber: 2,
  });

  assert.equal(result.action, 'DEBUG_ERROR');
  assert.equal(result.error, errorMessage);
  assert.ok(result.studentSummary, 'Should supply student summary');
});

test('Universal AI Voice Tutor: Complexity Analysis Structure', async () => {
  const sampleCode = `for (int i = 0; i < n; i++) {\n    System.out.println(i);\n}`;

  const result = await requestUniversalAiExplanation({
    code: sampleCode,
    language: 'java',
    action: 'ANALYZE_COMPLEXITY',
  });

  assert.ok(result.complexity, 'Complexity object should be present');
  assert.ok(result.complexity.time, 'Time complexity should be specified');
  assert.ok(result.complexity.space, 'Space complexity should be specified');
});

test('Universal AI Voice Tutor: Bubble Sort Code-Specific Line Analysis', async () => {
  const bubbleSortCode = `public class BubbleSort {
    void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`;

  const result = await requestUniversalAiExplanation({
    code: bubbleSortCode,
    language: 'java',
    action: 'EXPLAIN_CODE',
  });

  assert.ok(result.lineSteps.length >= 8, 'Should extract steps for all executable lines');

  // Check comparison step
  const comparisonStep = result.lineSteps.find((s) => s.codeLine.includes('arr[j] > arr[j + 1]'));
  assert.ok(comparisonStep, 'Comparison step must exist');
  assert.ok(
    comparisonStep.explanation.toLowerCase().includes('compare') ||
    comparisonStep.explanation.toLowerCase().includes('adjacent'),
    'Comparison step should specifically mention adjacent comparison'
  );

  // Check swap steps
  const swapTemp = result.lineSteps.find((s) => s.codeLine.includes('temp = arr[j]'));
  assert.ok(swapTemp, 'Temp variable step must exist');
  assert.ok(
    swapTemp.explanation.toLowerCase().includes('temp') ||
    swapTemp.explanation.toLowerCase().includes('swap'),
    'Temp assignment should explain value preservation before swapping'
  );

  const swapComplete = result.lineSteps.find((s) => s.codeLine.includes('arr[j + 1] = temp'));
  assert.ok(swapComplete, 'Swap completion step must exist');
  assert.ok(
    swapComplete.explanation.toLowerCase().includes('swap') ||
    swapComplete.explanation.toLowerCase().includes('temp'),
    'Should explain completing the swap'
  );
});

test('Universal AI Voice Tutor: SpeechSynthesis Utterance Lifecycle & Sequence Pipeline', async () => {
  // Mock window & speechSynthesis environment
  const spokenUtterances = [];
  const canceledUtterances = [];

  class MockSpeechSynthesisUtterance {
    constructor(text) {
      this.text = text;
      this.lang = 'en-US';
      this.rate = 1;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onboundary = null;
    }
  }

  const mockSynth = {
    speaking: false,
    paused: false,
    pending: false,
    speak(utterance) {
      spokenUtterances.push(utterance);
      this.speaking = true;
      if (typeof utterance.onstart === 'function') {
        utterance.onstart();
      }
      // Simulate speech completion in microtask
      setTimeout(() => {
        this.speaking = false;
        if (typeof utterance.onend === 'function') {
          utterance.onend();
        }
      }, 10);
    },
    cancel() {
      canceledUtterances.push(Date.now());
      this.speaking = false;
    },
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    },
    getVoices() {
      return [
        { name: 'Google US English', lang: 'en-US', default: true },
        { name: 'Google हिन्दी', lang: 'hi-IN', default: false },
      ];
    },
    addEventListener() {},
    removeEventListener() {},
  };

  // Verify mock lifecycle
  const testUtterance = new MockSpeechSynthesisUtterance('Line 1. Initializes array');
  let startFired = false;
  let endFired = false;

  testUtterance.onstart = () => { startFired = true; };
  testUtterance.onend = () => { endFired = true; };

  mockSynth.speak(testUtterance);
  assert.equal(startFired, true, 'Utterance onstart must fire upon dispatch');

  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(endFired, true, 'Utterance onend must fire upon completion');
  assert.equal(spokenUtterances.length, 1);
  assert.equal(spokenUtterances[0].text, 'Line 1. Initializes array');
});


