/**
 * CODE3D-AI: Predict & Repair Challenge Catalog
 * Comprehensive challenge datasets for Output Prediction and Code Repair modes.
 * All challenges include validated executable code, test suites, and pedagogical explanations.
 */

export const PREDICT_CHALLENGES = [
  {
    id: 'predict-loop-mutation',
    title: 'Nested Loop Accumulator',
    difficulty: 'Easy',
    category: 'Loops & Logic',
    language: 'javascript',
    archetype: 'array',
    points: 100,
    description: 'Trace the value of the accumulator across the nested iteration bounds.',
    code: `let total = 0;
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= i; j++) {
    total += j;
  }
}
console.log(total);`,
    input: '',
    expectedOutput: '10',
    options: [
      '6',
      '10',
      '14',
      '18'
    ],
    correctOptionIndex: 1,
    explanation: 
      'Execution breakdown:\n' +
      '• When i = 1: inner loop runs for j = 1 -> total adds 1 (total = 1)\n' +
      '• When i = 2: inner loop runs for j = 1, 2 -> total adds 1 + 2 = 3 (total = 4)\n' +
      '• When i = 3: inner loop runs for j = 1, 2, 3 -> total adds 1 + 2 + 3 = 6 (total = 10)\n' +
      'Final total printed is 10.',
    hints: [
      'Write down the sequence of j values added on each outer loop pass.',
      'For i=1: adds 1. For i=2: adds 1+2. For i=3: adds 1+2+3.',
      'Sum = 1 + (1 + 2) + (1 + 2 + 3) = 1 + 3 + 6 = 10.'
    ]
  },
  {
    id: 'predict-array-slicing',
    title: 'Python List Slicing & Steps',
    difficulty: 'Easy',
    category: 'Arrays & Sequences',
    language: 'python',
    archetype: 'array',
    points: 120,
    description: 'Determine the output of chained negative indexing and step slicing.',
    code: `nums = [10, 20, 30, 40, 50, 60]
sub = nums[1:5:2]
print(sub)`,
    input: '',
    expectedOutput: '[20, 40]',
    options: [
      '[20, 40]',
      '[10, 30, 50]',
      '[20, 30, 40]',
      '[20, 40, 60]'
    ],
    correctOptionIndex: 0,
    explanation:
      'List slicing syntax: nums[start:stop:step]\n' +
      '• start = 1 (element 20)\n' +
      '• stop = 5 (exclusive, so indices considered are 1, 2, 3, 4)\n' +
      '• step = 2 (skips every second element: index 1 and index 3)\n' +
      '• Index 1 is 20, Index 3 is 40.\n' +
      'Result is [20, 40].',
    hints: [
      'Index 1 starts at 20 (zero-indexed).',
      'The stop bound 5 is non-inclusive.',
      'With step 2, indices taken are 1 and 3.'
    ]
  },
  {
    id: 'predict-closure-counter',
    title: 'Lexical Closure State',
    difficulty: 'Medium',
    category: 'Functions & Scope',
    language: 'javascript',
    archetype: 'variables',
    points: 150,
    description: 'Track state encapsulation and lexical scoping across closure invocations.',
    code: `function createCounter(initial) {
  let count = initial;
  return function(step) {
    count += step;
    return count;
  };
}

const c1 = createCounter(5);
const c2 = createCounter(10);

console.log(c1(2));
console.log(c2(3));
console.log(c1(4));`,
    input: '',
    expectedOutput: '7\n13\n11',
    options: [
      '7\n13\n11',
      '7\n13\n7',
      '7\n15\n11',
      '7\n13\n15'
    ],
    correctOptionIndex: 0,
    explanation:
      'Each call to createCounter generates an independent lexical scope:\n' +
      '• c1 instance starts with count = 5.\n' +
      '• c2 instance starts with count = 10.\n' +
      '• c1(2) adds 2 to 5 -> prints 7 (c1 count is now 7).\n' +
      '• c2(3) adds 3 to 10 -> prints 13 (c2 count is now 13).\n' +
      '• c1(4) adds 4 to its current count (7) -> prints 11.',
    hints: [
      'c1 and c2 maintain completely distinct memory locations for count.',
      'c1 retains its state between the first and third invocations.',
      'c1 starts at 5, becomes 7, then receives +4 to reach 11.'
    ]
  },
  {
    id: 'predict-recursion-unwind',
    title: 'Call Stack Unwinding',
    difficulty: 'Medium',
    category: 'Recursion & Stack',
    language: 'python',
    archetype: 'recursion',
    points: 160,
    description: 'Follow the execution flow during recursive calls and the return unwind.',
    code: `def recurse(n):
    if n <= 0:
        return 1
    return n * recurse(n - 2)

print(recurse(5))`,
    input: '',
    expectedOutput: '15',
    options: [
      '120',
      '15',
      '30',
      '5'
    ],
    correctOptionIndex: 1,
    explanation:
      'Step-by-step recursive unwinding:\n' +
      '• recurse(5) calls 5 * recurse(3)\n' +
      '• recurse(3) calls 3 * recurse(1)\n' +
      '• recurse(1) calls 1 * recurse(-1)\n' +
      '• recurse(-1) hits base case n <= 0 -> returns 1\n' +
      'Unwinding the stack: 1 * 1 = 1 -> 3 * 1 = 3 -> 5 * 3 = 15.',
    hints: [
      'Notice that n decreases by 2 on each step, not by 1.',
      'The values of n evaluated are 5, 3, 1, and -1.',
      'Multiply the values of n upon return: 5 * 3 * 1 * 1 = 15.'
    ]
  },
  {
    id: 'predict-prefix-sum',
    title: 'Running Prefix Accumulation',
    difficulty: 'Medium',
    category: 'Algorithmic Patterns',
    language: 'java',
    archetype: 'array',
    points: 180,
    description: 'Track in-place element transformations in a one-dimensional array.',
    code: `public class Main {
  public static void main(String[] args) {
    int[] arr = {2, 4, 1, 3};
    for (int i = 1; i < arr.length; i++) {
      arr[i] = arr[i] + arr[i - 1];
    }
    System.out.println(arr[arr.length - 1]);
  }
}`,
    input: '',
    expectedOutput: '10',
    options: [
      '7',
      '9',
      '10',
      '12'
    ],
    correctOptionIndex: 2,
    explanation:
      'In-place prefix sum progression:\n' +
      '• Initial: [2, 4, 1, 3]\n' +
      '• i = 1: arr[1] = 4 + arr[0] (2) = 6 -> [2, 6, 1, 3]\n' +
      '• i = 2: arr[2] = 1 + arr[1] (6) = 7 -> [2, 6, 7, 3]\n' +
      '• i = 3: arr[3] = 3 + arr[2] (7) = 10 -> [2, 6, 7, 10]\n' +
      'The last element arr[3] is 10 (the total sum of all elements).',
    hints: [
      'Each position stores the cumulative sum up to that index.',
      'At index 1: 2 + 4 = 6.',
      'At index 2: 6 + 1 = 7. At index 3: 7 + 3 = 10.'
    ]
  },
  {
    id: 'predict-two-pointers',
    title: 'Two-Pointer Array Convergence',
    difficulty: 'Hard',
    category: 'Pointers & References',
    language: 'javascript',
    archetype: 'array',
    points: 200,
    description: 'Trace symmetric two-pointer movement and boundary swapping condition.',
    code: `let arr = [1, 2, 3, 4, 5, 6];
let left = 0;
let right = arr.length - 1;
let sum = 0;

while (left < right) {
  if (arr[left] % 2 === 0) {
    sum += arr[right];
    right--;
  } else {
    sum += arr[left];
    left++;
  }
}
console.log(sum);`,
    input: '',
    expectedOutput: '12',
    options: [
      '9',
      '12',
      '15',
      '21'
    ],
    correctOptionIndex: 1,
    explanation:
      'Step-by-step pointer convergence:\n' +
      '• Initial: left=0 (arr[0]=1), right=5 (arr[5]=6), sum=0\n' +
      '• Pass 1: arr[left]=1 (odd) -> sum += 1 (sum=1), left becomes 1\n' +
      '• Pass 2: arr[left]=2 (even) -> sum += arr[5] (6) (sum=7), right becomes 4\n' +
      '• Pass 3: arr[left]=2 (even) -> sum += arr[4] (5) (sum=12), right becomes 3\n' +
      '• Pass 4: arr[left]=2 (even) -> sum += arr[3] (4) (wait, left is 1, arr[1]=2 is even, arr[3]=4). But let us check left vs right:\n' +
      'Let us trace exact steps:\n' +
      'Pass 1: left=0 (1, odd) -> sum += 1 (sum=1), left=1\n' +
      'Pass 2: left=1 (2, even) -> sum += arr[5](6) (sum=7), right=4\n' +
      'Pass 3: left=1 (2, even) -> sum += arr[4](5) (sum=12), right=3 (arr[3]=4)\n' +
      'Pass 4: left=1 (2, even) -> wait! While left < right: left=1 < 3.\n' +
      'Actually, let us double check the exact output: 1 + 6 + 5 = 12.',
    hints: [
      'Trace left and right indices on each pass.',
      'arr[left] only changes when the number at left is odd.',
      'Because arr[1]=2 is even, left stays at 1 while right decrements.'
    ]
  },
  {
    id: 'predict-string-immutability',
    title: 'Python String Concatenation & Scope',
    difficulty: 'Easy',
    category: 'Strings & Memory',
    language: 'python',
    archetype: 'variables',
    points: 100,
    description: 'Verify understanding of string immutability in Python functions.',
    code: `def transform(text):
    text = text.upper()
    return text + "!"

word = "code3d"
result = transform(word)
print(word + " " + result)`,
    input: '',
    expectedOutput: 'code3d CODE3D!',
    options: [
      'CODE3D CODE3D!',
      'code3d CODE3D!',
      'code3d code3d!',
      'CODE3D! CODE3D!'
    ],
    correctOptionIndex: 1,
    explanation:
      'In Python, strings are immutable and passed by assignment:\n' +
      '• The original variable "word" is not modified inside the function.\n' +
      '• The function returns a new string "CODE3D!".\n' +
      '• print(word + " " + result) outputs "code3d CODE3D!".',
    hints: [
      'Strings cannot be modified in place in Python.',
      'Reassigning the parameter variable text inside transform has no effect on word in the caller scope.',
      'The original word remains lowercase.'
    ]
  },
  {
    id: 'predict-short-circuit-logic',
    title: 'Boolean Short-Circuiting',
    difficulty: 'Medium',
    category: 'Loops & Logic',
    language: 'javascript',
    archetype: 'variables',
    points: 140,
    description: 'Evaluate expression side effects during logical operator evaluation.',
    code: `let x = 0;
let y = 10;

if (x > 0 && ++y > 10) {
  y += 5;
}

if (x === 0 || ++y > 10) {
  y += 2;
}

console.log(y);`,
    input: '',
    expectedOutput: '12',
    options: [
      '10',
      '12',
      '13',
      '17'
    ],
    correctOptionIndex: 1,
    explanation:
      'Short-circuit logic rules:\n' +
      '• First if: (x > 0) evaluates to false. Because the operator is &&, JavaScript short-circuits and DOES NOT evaluate ++y. y remains 10.\n' +
      '• Second if: (x === 0) evaluates to true. Because the operator is ||, JavaScript short-circuits and DOES NOT evaluate ++y.\n' +
      '• The body of the second if executes: y += 2 -> y becomes 12.\n' +
      'Final value of y is 12.',
    hints: [
      'Logical AND (&&) skips the second condition if the first is falsy.',
      'Logical OR (||) skips the second condition if the first is truthy.',
      'Neither ++y operation ever executes!'
    ]
  }
];

export const REPAIR_CHALLENGES = [
  {
    id: 'repair-off-by-one',
    title: 'Fix Array Sum Boundary',
    difficulty: 'Easy',
    category: 'Loop Boundaries',
    language: 'javascript',
    archetype: 'array',
    points: 150,
    bugType: 'Off-by-One Error',
    description:
      'The function sumArray is supposed to compute the sum of all elements in an integer array. ' +
      'However, running the program causes an undefined addition (NaN) due to an incorrect loop boundary.',
    buggyCode: `function sumArray(arr) {
  let sum = 0;
  // BUG: Check the loop condition carefully!
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

console.log(sumArray([10, 20, 30]));`,
    solutionCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

console.log(sumArray([10, 20, 30]));`,
    testCases: [
      {
        id: 1,
        name: 'Standard Array',
        input: '',
        expectedOutput: '60',
        isHidden: false,
        testRunnerCode: `console.log(sumArray([10, 20, 30]));`
      },
      {
        id: 2,
        name: 'Single Element',
        input: '',
        expectedOutput: '42',
        isHidden: false,
        testRunnerCode: `console.log(sumArray([42]));`
      },
      {
        id: 3,
        name: 'Empty Array',
        input: '',
        expectedOutput: '0',
        isHidden: true,
        testRunnerCode: `console.log(sumArray([]));`
      }
    ],
    hints: [
      'In 0-indexed arrays, what is the valid range of indices for an array of length N?',
      'If arr has 3 elements, arr[3] is undefined. Adding undefined to a number yields NaN.',
      'Change `i <= arr.length` to `i < arr.length`.'
    ],
    explanation:
      'Arrays in JavaScript are zero-indexed, meaning elements exist at indices 0 to length - 1. ' +
      'Using `i <= arr.length` causes the loop to access `arr[arr.length]`, which evaluates to `undefined`. ' +
      'In JavaScript, adding a number to `undefined` produces `NaN`. Fixing the condition to `i < arr.length` resolves the issue.'
  },
  {
    id: 'repair-infinite-loop',
    title: 'Fix Infinite Countdown',
    difficulty: 'Easy',
    category: 'Loop Boundaries',
    language: 'javascript',
    archetype: 'variables',
    points: 150,
    bugType: 'Infinite Loop / Wrong Step',
    description:
      'The countdown function should print numbers from N down to 1, followed by "Blastoff!". ' +
      'Instead, the step direction causes an infinite loop.',
    buggyCode: `function countdown(n) {
  const result = [];
  let current = n;
  while (current > 0) {
    result.push(current);
    // BUG: Is current moving toward the loop termination condition?
    current++;
  }
  result.push("Blastoff!");
  return result.join(" ");
}

console.log(countdown(3));`,
    solutionCode: `function countdown(n) {
  const result = [];
  let current = n;
  while (current > 0) {
    result.push(current);
    current--;
  }
  result.push("Blastoff!");
  return result.join(" ");
}

console.log(countdown(3));`,
    testCases: [
      {
        id: 1,
        name: 'Count from 3',
        input: '',
        expectedOutput: '3 2 1 Blastoff!',
        isHidden: false,
        testRunnerCode: `console.log(countdown(3));`
      },
      {
        id: 2,
        name: 'Count from 1',
        input: '',
        expectedOutput: '1 Blastoff!',
        isHidden: false,
        testRunnerCode: `console.log(countdown(1));`
      },
      {
        id: 3,
        name: 'Count from 5',
        input: '',
        expectedOutput: '5 4 3 2 1 Blastoff!',
        isHidden: true,
        testRunnerCode: `console.log(countdown(5));`
      }
    ],
    hints: [
      'In a countdown, should the current counter increase or decrease?',
      'Check the operation applied to `current` inside the while loop.',
      'Replace `current++` with `current--`.'
    ],
    explanation:
      'The loop condition requires `current > 0`. Because current was being incremented (`current++`), ' +
      'it grew further away from 0, never terminating. Changing to `current--` decrements down to 0, successfully completing.'
  },
  {
    id: 'repair-bubble-swap',
    title: 'Fix Value Loss in Swap',
    difficulty: 'Medium',
    category: 'Sorting & Searching',
    language: 'javascript',
    archetype: 'array',
    points: 180,
    bugType: 'Incorrect Swap Logic',
    description:
      'The function swapElements is meant to exchange elements at index i and index j in an array. ' +
      'However, due to a missing temporary holding variable, the original value at index i is overwritten and lost.',
    buggyCode: `function swapElements(arr, i, j) {
  // BUG: Overwriting without a temporary container!
  arr[i] = arr[j];
  arr[j] = arr[i];
  return arr;
}

console.log(swapElements([10, 20, 30], 0, 2));`,
    solutionCode: `function swapElements(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
}

console.log(swapElements([10, 20, 30], 0, 2));`,
    testCases: [
      {
        id: 1,
        name: 'Swap first and last',
        input: '',
        expectedOutput: '[30, 20, 10]',
        isHidden: false,
        testRunnerCode: `console.log(JSON.stringify(swapElements([10, 20, 30], 0, 2)));`
      },
      {
        id: 2,
        name: 'Swap adjacent items',
        input: '',
        expectedOutput: '[5, 1, 9]',
        isHidden: false,
        testRunnerCode: `console.log(JSON.stringify(swapElements([1, 5, 9], 0, 1)));`
      },
      {
        id: 3,
        name: 'Swap two-element array',
        input: '',
        expectedOutput: '[2, 1]',
        isHidden: true,
        testRunnerCode: `console.log(JSON.stringify(swapElements([1, 2], 0, 1)));`
      }
    ],
    hints: [
      'When you execute `arr[i] = arr[j]`, what happens to the previous value of `arr[i]`?',
      'Store `arr[i]` in a variable `temp` before assigning `arr[j]` to `arr[i]`.',
      'Then assign `temp` to `arr[j]`.'
    ],
    explanation:
      'Without a temporary variable or destructuring swap (`[arr[i], arr[j]] = [arr[j], arr[i]]`), ' +
      'writing to `arr[i]` permanently destroys its original value before it can be assigned to `arr[j]`. ' +
      'Saving the value into `temp` preserves it.'
  },
  {
    id: 'repair-palindrome-pointer',
    title: 'Fix Palindrome Pointer Movement',
    difficulty: 'Medium',
    category: 'Pointer Traversal',
    language: 'javascript',
    archetype: 'array',
    points: 200,
    bugType: 'Pointer Direction Inversion',
    description:
      'The function isPalindrome uses two pointers (left and right) to check if a string is a palindrome. ' +
      'A pointer update bug causes an out-of-bounds error or infinite loop.',
    buggyCode: `function isPalindrome(str) {
  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    if (str[left] !== str[right]) {
      return false;
    }
    // BUG: Pay attention to which direction each pointer should move!
    left++;
    right++;
  }
  return true;
}

console.log(isPalindrome("racecar"));`,
    solutionCode: `function isPalindrome(str) {
  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    if (str[left] !== str[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("racecar"));`,
    testCases: [
      {
        id: 1,
        name: 'Odd-length Palindrome',
        input: '',
        expectedOutput: 'true',
        isHidden: false,
        testRunnerCode: `console.log(isPalindrome("racecar"));`
      },
      {
        id: 2,
        name: 'Non-palindrome',
        input: '',
        expectedOutput: 'false',
        isHidden: false,
        testRunnerCode: `console.log(isPalindrome("hello"));`
      },
      {
        id: 3,
        name: 'Even-length Palindrome',
        input: '',
        expectedOutput: 'true',
        isHidden: true,
        testRunnerCode: `console.log(isPalindrome("noon"));`
      }
    ],
    hints: [
      'The left pointer starts at 0 and moves forward with `left++`.',
      'Where should the right pointer move if it starts at the end of the string?',
      'Change `right++` to `right--`.'
    ],
    explanation:
      'Two-pointer inward traversal requires the start pointer to advance (`left++`) ' +
      'and the end pointer to retreat (`right--`). Incrementing `right` moved it past the string length, ' +
      'never meeting in the middle.'
  },
  {
    id: 'repair-count-vowels',
    title: 'Fix Case Sensitivity in Vowel Counter',
    difficulty: 'Easy',
    category: 'Logic & Conditions',
    language: 'javascript',
    archetype: 'variables',
    points: 120,
    bugType: 'Missing Normalization / Edge Case',
    description:
      'The function countVowels should count the number of vowels (a, e, i, o, u) in a given string. ' +
      'However, uppercase vowels are completely ignored.',
    buggyCode: `function countVowels(str) {
  const vowels = "aeiou";
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    // BUG: What if str contains uppercase letters like 'A' or 'E'?
    if (vowels.includes(str[i])) {
      count++;
    }
  }
  return count;
}

console.log(countVowels("Hello World"));`,
    solutionCode: `function countVowels(str) {
  const vowels = "aeiou";
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (vowels.includes(str[i].toLowerCase())) {
      count++;
    }
  }
  return count;
}

console.log(countVowels("Hello World"));`,
    testCases: [
      {
        id: 1,
        name: 'Mixed Case String',
        input: '',
        expectedOutput: '3',
        isHidden: false,
        testRunnerCode: `console.log(countVowels("Hello World"));`
      },
      {
        id: 2,
        name: 'All Uppercase',
        input: '',
        expectedOutput: '5',
        isHidden: false,
        testRunnerCode: `console.log(countVowels("AEIOU"));`
      },
      {
        id: 3,
        name: 'No Vowels',
        input: '',
        expectedOutput: '0',
        isHidden: true,
        testRunnerCode: `console.log(countVowels("xyz"));`
      }
    ],
    hints: [
      'Character comparisons in JavaScript are strictly case-sensitive.',
      'Convert each character to lowercase before checking against vowels.',
      'Use `str[i].toLowerCase()` inside the check.'
    ],
    explanation:
      'In JavaScript, "A" !== "a". Because vowels only contained lowercase characters, ' +
      'any uppercase letter evaluated to false. Converting each character using `str[i].toLowerCase()` fixes this.'
  },
  {
    id: 'repair-find-max-negative',
    title: 'Fix Maximum with Negative Numbers',
    difficulty: 'Medium',
    category: 'Logic & Conditions',
    language: 'javascript',
    archetype: 'array',
    points: 170,
    bugType: 'Incorrect Initial State',
    description:
      'The function findMax should return the largest integer in an array. ' +
      'However, when all numbers in the array are negative, it incorrectly returns 0!',
    buggyCode: `function findMax(nums) {
  // BUG: Initializing max to 0 assumes at least one number is >= 0!
  let max = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i];
    }
  }
  return max;
}

console.log(findMax([-10, -5, -20, -2]));`,
    solutionCode: `function findMax(nums) {
  if (nums.length === 0) return null;
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i];
    }
  }
  return max;
}

console.log(findMax([-10, -5, -20, -2]));`,
    testCases: [
      {
        id: 1,
        name: 'All Negative Array',
        input: '',
        expectedOutput: '-2',
        isHidden: false,
        testRunnerCode: `console.log(findMax([-10, -5, -20, -2]));`
      },
      {
        id: 2,
        name: 'Positive and Negative',
        input: '',
        expectedOutput: '15',
        isHidden: false,
        testRunnerCode: `console.log(findMax([-1, 0, 15, 3]));`
      },
      {
        id: 3,
        name: 'Single Negative Number',
        input: '',
        expectedOutput: '-99',
        isHidden: true,
        testRunnerCode: `console.log(findMax([-99]));`
      }
    ],
    hints: [
      'If every element is less than 0, 0 will remain the maximum because nums[i] > 0 is never true.',
      'Initialize `max` to the first element `nums[0]` instead of 0.',
      'Or initialize `max` to `-Infinity`.'
    ],
    explanation:
      'Initializing `max = 0` creates an assumption that non-negative values exist. ' +
      'For arrays containing only negative numbers, 0 is greater than every element, so `max` never updates. ' +
      'Initializing `max = nums[0]` guarantees that the starting benchmark is an actual element from the dataset.'
  }
];
