import { getPrisma, isDbOnline } from '../db.js';

export const memoryQuizAttempts = [];

// Server-side active quiz session cache (stores answers securely)
const activeQuizSessions = new Map();

// Periodic cleanup of sessions older than 2 hours
const sessionCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeQuizSessions.entries()) {
    if (now - session.createdAt > 2 * 60 * 60 * 1000) {
      activeQuizSessions.delete(id);
    }
  }
}, 15 * 60 * 1000);
if (sessionCleanupTimer.unref) {
  sessionCleanupTimer.unref();
}

// Comprehensive built-in curated question bank for fallback / offline generation
const CURATED_QUIZ_BANK = {
  arrays: [
    {
      id: 'arr_1',
      topic: 'Arrays',
      difficulty: 'easy',
      question: 'What is the time complexity to access an element at index i in a contiguous memory array?',
      codeSnippet: 'int[] arr = {10, 20, 30, 40};\nint val = arr[2];',
      options: ['O(1) constant time', 'O(n) linear time', 'O(log n) logarithmic time', 'O(n²) quadratic time'],
      correctIndex: 0,
      explanation: 'Array elements are placed in contiguous memory blocks. Accessing index i is computed directly via base_address + i * size_of(element), which takes O(1) time.',
    },
    {
      id: 'arr_2',
      topic: 'Arrays',
      difficulty: 'medium',
      question: 'What will be the output of this Java loop after all iterations complete?',
      codeSnippet: 'int[] a = {1, 2, 3, 4};\nint s = 0;\nfor (int i = 0; i < a.length; i++) {\n    if (a[i] % 2 == 0) s += a[i];\n}\nSystem.out.println(s);',
      options: ['10', '6', '4', '0'],
      correctIndex: 1,
      explanation: 'The loop adds even numbers only: 2 + 4 = 6. Odd numbers 1 and 3 are ignored.',
    },
    {
      id: 'arr_3',
      topic: 'Arrays',
      difficulty: 'hard',
      question: 'In Kadane\'s Algorithm for Maximum Subarray Sum, what is the core recurrence relation?',
      codeSnippet: 'curr_sum = Math.max(x, curr_sum + x);\nmax_sum = Math.max(max_sum, curr_sum);',
      options: [
        'Decide whether to extend the existing contiguous subarray or restart a new subarray from current element',
        'Sort the array first in O(n log n) and sum all positive integers',
        'Calculate prefix sum array and find difference between max and min element',
        'Use two nested loops to evaluate all O(n²) contiguous subarrays',
      ],
      correctIndex: 0,
      explanation: 'Kadane\'s algorithm decides at each element x whether adding x to curr_sum yields a better subarray or if starting fresh from x is optimal.',
    },
    {
      id: 'arr_4',
      topic: 'Arrays',
      difficulty: 'medium',
      question: 'What is the auxiliary space complexity of reversing an array in-place using two pointers?',
      codeSnippet: 'int l = 0, r = arr.length - 1;\nwhile (l < r) {\n    int temp = arr[l]; arr[l++] = arr[r]; arr[r--] = temp;\n}',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 0,
      explanation: 'The two-pointer swap uses only three scalar variables (l, r, temp), requiring O(1) auxiliary space without allocating secondary memory.',
    },
    {
      id: 'arr_5',
      topic: 'Arrays',
      difficulty: 'easy',
      question: 'What exception is thrown in Java when evaluating `arr[arr.length]`?',
      codeSnippet: 'int[] arr = new int[5];\nint x = arr[5];',
      options: ['ArrayIndexOutOfBoundsException', 'NullPointerException', 'IndexError', 'IllegalArgumentException'],
      correctIndex: 0,
      explanation: 'Java arrays are 0-indexed. An array of length 5 has indices 0 through 4. Accessing index 5 triggers ArrayIndexOutOfBoundsException.',
    },
  ],
  'linked-list': [
    {
      id: 'll_1',
      topic: 'Linked Lists',
      difficulty: 'easy',
      question: 'What is the worst-case time complexity to search for a value in a singly linked list with n nodes?',
      codeSnippet: 'Node curr = head;\nwhile (curr != null && curr.val != target) {\n    curr = curr.next;\n}',
      options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
      correctIndex: 0,
      explanation: 'Unlike arrays, linked list nodes are scattered across heap memory without index arithmetic. Finding an element requires sequential traversal through up to n pointers, taking O(n) time.',
    },
    {
      id: 'll_2',
      topic: 'Linked Lists',
      difficulty: 'medium',
      question: 'What does Floyd\'s Cycle Detection (Tortoise and Hare) algorithm guarantee?',
      codeSnippet: 'Node slow = head, fast = head;\nwhile (fast != null && fast.next != null) {\n    slow = slow.next; fast = fast.next.next;\n    if (slow == fast) return true;\n}',
      options: [
        'Detects cycles in O(n) time using O(1) auxiliary space',
        'Sorts the linked list in O(n log n) time',
        'Reverses the linked list in O(1) time',
        'Finds the maximum node value using divide-and-conquer',
      ],
      correctIndex: 0,
      explanation: 'Floyd\'s algorithm moves slow by 1 and fast by 2. If a cycle exists, the relative distance decreases by 1 each step, ensuring meeting in O(n) time with O(1) space.',
    },
    {
      id: 'll_3',
      topic: 'Linked Lists',
      difficulty: 'medium',
      question: 'What is the pointer mutation required to delete the node immediately following `curr`?',
      codeSnippet: 'Node nextNode = curr.next;\n// Complete operation',
      options: ['curr.next = curr.next.next;', 'curr = curr.next;', 'curr.next = null;', 'curr.next.next = curr;'],
      correctIndex: 0,
      explanation: 'Bypassing the node with `curr.next = curr.next.next` unlinks it from the chain. In Java, unreferenced nodes are reclaimed by garbage collection.',
    },
  ],
  'stacks-queues': [
    {
      id: 'sq_1',
      topic: 'Stacks & Queues',
      difficulty: 'easy',
      question: 'Which ordering principle governs Stacks and Queues respectively?',
      codeSnippet: '// Stack: push/pop\n// Queue: enqueue/dequeue',
      options: ['Stack: LIFO (Last-In-First-Out), Queue: FIFO (First-In-First-Out)', 'Stack: FIFO, Queue: LIFO', 'Both use LIFO', 'Both use FIFO'],
      correctIndex: 0,
      explanation: 'Stacks process the most recently pushed item first (LIFO), whereas Queues process the oldest enqueued item first (FIFO).',
    },
    {
      id: 'sq_2',
      topic: 'Stacks & Queues',
      difficulty: 'medium',
      question: 'When validating balanced parentheses, what condition indicates an invalid string immediately?',
      codeSnippet: 'String s = "({[)]}";',
      options: [
        'Encountering a closing bracket when the stack is empty, or matching against a different opening bracket type',
        'String length being a multiple of 2',
        'Encountering duplicate opening brackets',
        'Using array-based stack instead of linked-list stack',
      ],
      correctIndex: 0,
      explanation: 'A closing bracket must match the most recently opened bracket at stack top. If the stack is empty or the top bracket type does not match, the sequence is invalid.',
    },
  ],
  trees: [
    {
      id: 'tr_1',
      topic: 'Trees & BSTs',
      difficulty: 'easy',
      question: 'What property uniquely defines a Binary Search Tree (BST)?',
      codeSnippet: 'class TreeNode {\n    int val;\n    TreeNode left, right;\n}',
      options: [
        'Left subtree values are strictly smaller than node; right subtree values are strictly greater',
        'Every level must be completely filled except possibly the last level',
        'Parent nodes always have smaller values than both left and right children',
        'Each node has exactly two children at all times',
      ],
      correctIndex: 0,
      explanation: 'A BST satisfies the invariant that all nodes in its left subtree are less than the root value, and all nodes in its right subtree are greater than the root value.',
    },
    {
      id: 'tr_2',
      topic: 'Trees & BSTs',
      difficulty: 'medium',
      question: 'Which tree traversal yields elements of a BST in strictly sorted ascending order?',
      codeSnippet: 'void traverse(TreeNode root) {\n    if (root == null) return;\n    traverse(root.left);\n    System.out.println(root.val);\n    traverse(root.right);\n}',
      options: ['In-order traversal (Left, Root, Right)', 'Pre-order traversal (Root, Left, Right)', 'Post-order traversal (Left, Right, Root)', 'Level-order traversal (BFS)'],
      correctIndex: 0,
      explanation: 'In-order traversal visits Left -> Root -> Right. By the BST definition, this systematically processes keys from smallest to largest.',
    },
  ],
  sorting: [
    {
      id: 'sort_1',
      topic: 'Sorting & Searching',
      difficulty: 'easy',
      question: 'What is the best-case time complexity of optimized Bubble Sort with an early-exit swap flag?',
      codeSnippet: 'boolean swapped = false;\nfor (int j = 0; j < n - i - 1; j++) {\n    if (arr[j] > arr[j+1]) { swap(arr, j, j+1); swapped = true; }\n}\nif (!swapped) break;',
      options: ['O(n) linear time', 'O(n²) quadratic time', 'O(n log n)', 'O(1)'],
      correctIndex: 0,
      explanation: 'If the array is already sorted, no swaps occur in the first pass (swapped == false), allowing immediate termination after O(n) comparisons.',
    },
    {
      id: 'sort_2',
      topic: 'Sorting & Searching',
      difficulty: 'medium',
      question: 'Why does Binary Search require the input collection to be sorted beforehand?',
      codeSnippet: 'int mid = low + (high - low) / 2;\nif (arr[mid] == target) return mid;\nif (arr[mid] < target) low = mid + 1;\nelse high = mid - 1;',
      options: [
        'To guarantee that comparing against mid eliminates half of the remaining search space',
        'Because binary search only works on positive integers',
        'To prevent memory leaks in the call stack',
        'Because unsorted arrays cannot be indexed by integer offsets',
      ],
      correctIndex: 0,
      explanation: 'The monotonic ordering guarantees that if target > arr[mid], the target cannot exist in the left half, discarding n/2 elements in O(1) comparison.',
    },
    {
      id: 'sort_3',
      topic: 'Sorting & Searching',
      difficulty: 'hard',
      question: 'What is the worst-case time complexity of Quick Sort, and when does it occur?',
      codeSnippet: 'int partition(int[] arr, int low, int high) {\n    int pivot = arr[high]; // Lomuto partition\n}',
      options: [
        'O(n²) when the pivot chosen is always the extreme minimum or maximum (e.g. already sorted array with last-element pivot)',
        'O(n log n) under all possible inputs without exception',
        'O(n) when all elements are duplicates',
        'O(2ⁿ) due to recursive call stack growth',
      ],
      correctIndex: 0,
      explanation: 'When the partition is unbalanced (0 vs n-1 elements each level), Quick Sort degrades to n recursive frames of O(n) work each, yielding O(n²) worst-case time.',
    },
  ],
  dp: [
    {
      id: 'dp_1',
      topic: 'Dynamic Programming',
      difficulty: 'medium',
      question: 'What two properties must a problem possess to be optimally solved by Dynamic Programming?',
      codeSnippet: 'memo[n] = fib(n - 1) + fib(n - 2);',
      options: [
        'Overlapping Subproblems and Optimal Substructure',
        'Monotonic Ordering and Disjoint Sets',
        'Greedy Choice Property and Topological Sorting',
        'Divide and Conquer with Independent Subproblems',
      ],
      correctIndex: 0,
      explanation: 'DP applies when identical subproblems are solved repeatedly (Overlapping Subproblems) and the optimal solution to the problem contains optimal solutions to subproblems (Optimal Substructure).',
    },
  ],
  graphs: [
    {
      id: 'gr_1',
      topic: 'Graphs',
      difficulty: 'medium',
      question: 'Which data structure is typically used to implement Breadth-First Search (BFS) on an unweighted graph?',
      codeSnippet: 'Queue<Integer> q = new LinkedList<>();\nq.offer(startNode);',
      options: ['FIFO Queue', 'LIFO Stack', 'Priority Queue (Min-Heap)', 'Binary Search Tree'],
      correctIndex: 0,
      explanation: 'BFS explores vertices level by level using a FIFO Queue to ensure vertices at distance d are fully visited before vertices at distance d+1.',
    },
  ],
  java: [
    {
      id: 'jv_1',
      topic: 'Java OOP & Core',
      difficulty: 'easy',
      question: 'In Java, where are object instances allocated versus primitive local variables?',
      codeSnippet: 'int x = 42;\nString s = new String("Code3D");',
      options: [
        'Object instances are allocated on the Heap; primitive local variables reside on the Thread Stack',
        'Both reside strictly in CPU registers',
        'Both are allocated on the Heap',
        'Primitives are on the Heap; object instances are on the Stack',
      ],
      correctIndex: 0,
      explanation: 'In the JVM memory model, method activation frames on the call stack hold primitive local variables and reference pointers. The actual object instances reside on the garbage-collected Heap.',
    },
  ],
};

/**
 * POST /api/quiz/generate
 * Generates topic & difficulty-appropriate quiz questions.
 * Keeps answer keys and explanations strictly SERVER-SIDE.
 */
export async function generateQuiz(req, res) {
  try {
    const {
      topic = 'arrays',
      difficulty = 'medium',
      count = 5,
    } = req.body;

    const requestedCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);
    const normalizedTopic = String(topic).toLowerCase().replace(/[^a-z0-9-]/g, '');

    const apiKey = process.env.AI_API_KEY || null;
    let questionsWithAnswers = [];

    if (apiKey) {
      try {
        const prompt = `You are a Senior Computer Science Professor generating an interactive programming quiz for CODE3D-AI.
Generate exactly ${requestedCount} multiple-choice questions on Topic: "${topic}", Difficulty: "${difficulty}".
Format your response as a strict JSON array of objects. Do not wrap in markdown quotes if possible, or use standard \`\`\`json blocks.
Each object must follow this exact schema:
[
  {
    "id": "q1",
    "topic": "${topic}",
    "difficulty": "${difficulty}",
    "question": "Question text here?",
    "codeSnippet": "optional short code snippet or empty string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed pedagogical explanation of why this answer is correct and memory model implications."
  }
]
Important rules:
1. Provide exactly 4 distinct options per question.
2. "correctIndex" must be an integer from 0 to 3.
3. Keep questions technically rigorous, focused on data structures, algorithms, time/space complexity, and code execution.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const aiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4 },
          }),
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            questionsWithAnswers = parsed.map((q, idx) => ({
              id: q.id || `ai_q_${idx + 1}`,
              topic: q.topic || topic,
              difficulty: q.difficulty || difficulty,
              question: q.question,
              codeSnippet: q.codeSnippet || '',
              options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
              correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 ? q.correctIndex : 0,
              explanation: q.explanation || 'Verified correct answer.',
            }));
          }
        }
      } catch (aiErr) {
        console.warn('AI quiz generation upstream notice, using curated bank:', aiErr.message);
      }
    }

    // Fallback to high-quality curated bank if AI is offline or failed
    if (questionsWithAnswers.length === 0) {
      let candidateBank = CURATED_QUIZ_BANK[normalizedTopic];
      if (!candidateBank || candidateBank.length === 0) {
        // Find best match in bank
        const key = Object.keys(CURATED_QUIZ_BANK).find((k) => normalizedTopic.includes(k) || k.includes(normalizedTopic)) || 'arrays';
        candidateBank = CURATED_QUIZ_BANK[key] || CURATED_QUIZ_BANK.arrays;
      }

      // Shuffle candidate bank
      const shuffled = [...candidateBank].sort(() => 0.5 - Math.random());
      questionsWithAnswers = shuffled.slice(0, requestedCount);

      // If needed more, append from other categories
      if (questionsWithAnswers.length < requestedCount) {
        for (const cat of Object.keys(CURATED_QUIZ_BANK)) {
          if (questionsWithAnswers.length >= requestedCount) break;
          for (const item of CURATED_QUIZ_BANK[cat]) {
            if (!questionsWithAnswers.some((q) => q.id === item.id)) {
              questionsWithAnswers.push(item);
              if (questionsWithAnswers.length >= requestedCount) break;
            }
          }
        }
      }
    }

    // Generate unique session ID
    const sessionId = `quiz_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Store in memory session with full answer keys
    activeQuizSessions.set(sessionId, {
      id: sessionId,
      topic,
      difficulty,
      count: questionsWithAnswers.length,
      questions: questionsWithAnswers,
      score: 0,
      answeredCount: 0,
      answers: [],
      createdAt: Date.now(),
    });

    // Strip answers and explanations before sending to client (Rule 3)
    const clientSafeQuestions = questionsWithAnswers.map((q, idx) => ({
      id: q.id,
      index: idx,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      codeSnippet: q.codeSnippet,
      options: q.options,
    }));

    return res.json({
      success: true,
      sessionId,
      totalQuestions: clientSafeQuestions.length,
      topic,
      difficulty,
      questions: clientSafeQuestions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'QUIZ_GEN_ERROR', message: err.message || 'Failed to generate quiz.' },
    });
  }
}

/**
 * POST /api/quiz/submit-answer
 * Validates a user's answer server-side against the active session.
 */
export async function submitAnswer(req, res) {
  try {
    const { sessionId, questionId, selectedOption } = req.body;

    if (!sessionId || !activeQuizSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Quiz session expired or not found. Please start a new quiz.' },
      });
    }

    const session = activeQuizSessions.get(sessionId);
    const questionIndex = session.questions.findIndex((q) => q.id === questionId);

    if (questionIndex === -1) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUESTION', message: 'Question does not belong to active session.' },
      });
    }

    const question = session.questions[questionIndex];
    const isCorrect = Number(selectedOption) === question.correctIndex;

    if (isCorrect) {
      session.score += 1;
    }
    session.answeredCount += 1;
    session.answers.push({
      questionId,
      selectedOption: Number(selectedOption),
      correctIndex: question.correctIndex,
      isCorrect,
    });

    const isComplete = session.answeredCount >= session.questions.length;

    return res.json({
      success: true,
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      currentScore: session.score,
      answeredCount: session.answeredCount,
      totalQuestions: session.questions.length,
      isComplete,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SUBMIT_ERROR', message: err.message || 'Failed to submit quiz answer.' },
    });
  }
}

/**
 * GET /api/quiz/attempts
 * Retrieve authenticated user's quiz attempt history
 */
export async function getQuizAttempts(req, res) {
  try {
    const userId = req.user?.id || 'anonymous';

    if (isDbOnline()) {
      const prisma = getPrisma();
      try {
        const attempts = await prisma.$queryRaw`
          SELECT id, user_id, quiz_mode, category, score, total_questions, percentage, created_at
          FROM quiz_attempts
          WHERE user_id = ${userId}::uuid
          ORDER BY created_at DESC
        `;
        return res.json({ success: true, attempts });
      } catch (sqlErr) {
        // Fallback to memory
      }
    }

    const userAttempts = memoryQuizAttempts.filter((a) => a.userId === userId);
    return res.json({ success: true, attempts: userAttempts });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'QUIZ_FETCH_ERROR',
        message: 'Failed to retrieve quiz attempts.',
      },
    });
  }
}

/**
 * POST /api/quiz/attempts
 * Record a new quiz attempt for the user
 */
export async function recordQuizAttempt(req, res) {
  try {
    const userId = req.user?.id || 'anonymous';
    const { mode = 'Predict Output', category = 'Arrays', score = 0, totalQuestions = 5, answers = [] } = req.body;
    const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;

    if (isDbOnline() && req.user?.id) {
      const prisma = getPrisma();
      try {
        await prisma.$queryRaw`
          INSERT INTO quiz_attempts (id, user_id, quiz_mode, category, score, total_questions, percentage, answers_json)
          VALUES (uuid_generate_v4(), ${userId}::uuid, ${mode}, ${category}, ${score}, ${totalQuestions}, ${percentage}, ${JSON.stringify(answers)}::jsonb)
        `;
        return res.status(201).json({
          success: true,
          attempt: {
            userId,
            mode,
            category,
            score,
            totalQuestions,
            percentage,
            createdAt: new Date(),
          },
        });
      } catch (sqlErr) {
        // Fallback to memory
      }
    }

    const newAttempt = {
      id: `attempt-${Date.now()}`,
      userId,
      mode,
      category,
      score,
      totalQuestions,
      percentage,
      answers,
      createdAt: new Date(),
    };
    memoryQuizAttempts.unshift(newAttempt);
    return res.status(201).json({ success: true, attempt: newAttempt });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'QUIZ_RECORD_ERROR',
        message: 'Failed to record quiz attempt.',
      },
    });
  }
}
