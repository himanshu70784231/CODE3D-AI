/**
 * CODE3D-AI - Multi-Language Algorithmic Template Catalog
 * 
 * Provides verified, production-grade starter code in Java, Python, C++, C, and JavaScript
 * for all canonical data structures and algorithms in the platform.
 */

export const MULTI_LANG_TEMPLATES = {
  // 1. Array Loop / Traversal
  'array-loop': {
    java: `public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40};
        int sum = 0;

        for (int i = 0; i < arr.length; i++) {
            sum += arr[i];
            System.out.println("Element: " + arr[i]);
        }
        System.out.println("Total Sum: " + sum);
    }
}`,
    python: `arr = [10, 20, 30, 40]
total_sum = 0

for i in range(len(arr)):
    total_sum = total_sum + arr[i]
    print(f"Element: {arr[i]}")

print(f"Total Sum: {total_sum}")`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40};
    int sum = 0;

    for (int i = 0; i < arr.size(); i++) {
        sum += arr[i];
        cout << "Element: " << arr[i] << endl;
    }
    cout << "Total Sum: " << sum << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40};
    int n = sizeof(arr) / sizeof(arr[0]);
    int sum = 0;

    for (int i = 0; i < n; i++) {
        sum += arr[i];
        printf("Element: %d\\n", arr[i]);
    }
    printf("Total Sum: %d\\n", sum);
    return 0;
}`,
    javascript: `const arr = [10, 20, 30, 40];
let sum = 0;

for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    console.log("Element:", arr[i]);
}
console.log("Total Sum:", sum);`,
  },

  // 2. Bubble Sort
  'bubble-sort': {
    java: `public class BubbleSort {
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
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

        System.out.println("Array sorted successfully.");
    }
}`,
    python: `arr = [64, 34, 25, 12, 22, 11, 90]
n = len(arr)

for i in range(n - 1):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp

print("Sorted array:", arr)`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    int n = arr.size();

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    cout << "Sorted array size: " << n << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    printf("Sorted array with %d items\\n", n);
    return 0;
}`,
    javascript: `let arr = [64, 34, 25, 12, 22, 11, 90];
const n = arr.length;

for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}

console.log("Sorted array:", arr);`,
  },

  // 3. Selection Sort
  'selection-sort': {
    java: `public class SelectionSort {
    public static void main(String[] args) {
        int[] arr = {29, 10, 14, 37, 13};
        int n = arr.length;

        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
}`,
    python: `arr = [29, 10, 14, 37, 13]
n = len(arr)

for i in range(n - 1):
    min_idx = i
    for j in range(i + 1, n):
        if arr[j] < arr[min_idx]:
            min_idx = j
    temp = arr[min_idx]
    arr[min_idx] = arr[i]
    arr[i] = temp

print("Selection sorted:", arr)`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {29, 10, 14, 37, 13};
    int n = arr.size();

    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int arr[] = {29, 10, 14, 37, 13};
    int n = sizeof(arr) / sizeof(arr[0]);

    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
    return 0;
}`,
    javascript: `let arr = [29, 10, 14, 37, 13];
const n = arr.length;

for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIdx]) minIdx = j;
    }
    const temp = arr[minIdx];
    arr[minIdx] = arr[i];
    arr[i] = temp;
}
console.log("Sorted:", arr);`,
  },

  // 4. Binary Search
  'binary-search': {
    java: `public class BinarySearch {
    public static void main(String[] args) {
        int[] arr = {4, 9, 15, 23, 31, 42, 55, 68, 77, 90};
        int target = 42;
        int low = 0;
        int high = arr.length - 1;
        int foundIndex = -1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                foundIndex = mid;
                break;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        System.out.println("Target index: " + foundIndex);
    }
}`,
    python: `arr = [4, 9, 15, 23, 31, 42, 55, 68, 77, 90]
target = 42
low = 0
high = len(arr) - 1
found_idx = -1

while low <= high:
    mid = low + (high - low) // 2
    if arr[mid] == target:
        found_idx = mid
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1

print(f"Target found at index: {found_idx}")`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {4, 9, 15, 23, 31, 42, 55, 68, 77, 90};
    int target = 42;
    int low = 0;
    int high = arr.size() - 1;
    int foundIndex = -1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            foundIndex = mid;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    cout << "Found index: " << foundIndex << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int arr[] = {4, 9, 15, 23, 31, 42, 55, 68, 77, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = 42;
    int low = 0;
    int high = n - 1;
    int foundIndex = -1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            foundIndex = mid;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    printf("Found at: %d\\n", foundIndex);
    return 0;
}`,
    javascript: `const arr = [4, 9, 15, 23, 31, 42, 55, 68, 77, 90];
const target = 42;
let low = 0;
let high = arr.length - 1;
let foundIndex = -1;

while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    if (arr[mid] === target) {
        foundIndex = mid;
        break;
    } else if (arr[mid] < target) {
        low = mid + 1;
    } else {
        high = mid - 1;
    }
}
console.log("Found at index:", foundIndex);`,
  },

  // 5. Two Pointers / Reverse Array
  'two-pointer': {
    java: `public class TwoPointer {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6};
        int left = 0;
        int right = arr.length - 1;

        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}`,
    python: `arr = [1, 2, 3, 4, 5, 6]
left = 0
right = len(arr) - 1

while left < right:
    temp = arr[left]
    arr[left] = arr[right]
    arr[right] = temp
    left += 1
    right -= 1

print("Reversed:", arr)`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {1, 2, 3, 4, 5, 6};
    int left = 0;
    int right = arr.size() - 1;

    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5, 6};
    int left = 0;
    int right = 5;

    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
    return 0;
}`,
    javascript: `let arr = [1, 2, 3, 4, 5, 6];
let left = 0;
let right = arr.length - 1;

while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
}
console.log("Reversed:", arr);`,
  },

  // 6. Stack Operations
  'stack': {
    java: `import java.util.Stack;

public class StackDemo {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);

        int top = stack.peek();
        int popped = stack.pop();
        System.out.println("Popped: " + popped);
    }
}`,
    python: `stack = []
stack.append(10)
stack.append(20)
stack.append(30)

top_elem = stack[-1]
popped_elem = stack.pop()
print("Popped:", popped_elem)`,
    cpp: `#include <iostream>
#include <stack>
using namespace std;

int main() {
    stack<int> s;
    s.push(10);
    s.push(20);
    s.push(30);

    int top = s.top();
    s.pop();
    cout << "Top was: " << top << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int stack[10];
    int top = -1;

    stack[++top] = 10;
    stack[++top] = 20;
    stack[++top] = 30;

    int popped = stack[top--];
    printf("Popped element: %d\\n", popped);
    return 0;
}`,
    javascript: `const stack = [];
stack.push(10);
stack.push(20);
stack.push(30);

const popped = stack.pop();
console.log("Popped:", popped);`,
  },

  // 7. Queue Operations
  'queue': {
    java: `import java.util.LinkedList;
import java.util.Queue;

public class QueueDemo {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();
        queue.add(10);
        queue.add(20);
        queue.add(30);

        int front = queue.poll();
        System.out.println("Dequeued: " + front);
    }
}`,
    python: `from collections import deque

q = deque()
q.append(10)
q.append(20)
q.append(30)

front = q.popleft()
print("Dequeued:", front)`,
    cpp: `#include <iostream>
#include <queue>
using namespace std;

int main() {
    queue<int> q;
    q.push(10);
    q.push(20);
    q.push(30);

    int front = q.front();
    q.pop();
    cout << "Dequeued: " << front << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int queue[10];
    int front = 0, rear = 0;

    queue[rear++] = 10;
    queue[rear++] = 20;
    queue[rear++] = 30;

    int dequeued = queue[front++];
    printf("Dequeued: %d\\n", dequeued);
    return 0;
}`,
    javascript: `const queue = [];
queue.push(10);
queue.push(20);
queue.push(30);

const dequeued = queue.shift();
console.log("Dequeued:", dequeued);`,
  },
};

/**
 * Returns starter code for an algorithm and language
 */
export function getAlgorithmCode(conceptId, language = 'java', fallbackCode = '') {
  const cleanId = String(conceptId || 'array-loop').toLowerCase().replace(/_/g, '-');
  const lang = String(language || 'java').toLowerCase();

  const matchKey = Object.keys(MULTI_LANG_TEMPLATES).find(
    (k) => cleanId.includes(k) || k.includes(cleanId)
  );

  if (matchKey && MULTI_LANG_TEMPLATES[matchKey][lang]) {
    return MULTI_LANG_TEMPLATES[matchKey][lang];
  }

  // Fallback defaults per language if template is not explicitly registered
  if (lang === 'python') {
    return `arr = [10, 20, 30, 40]
for x in arr:
    print(x)`;
  }
  if (lang === 'cpp') {
    return `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40};
    for (int x : arr) cout << x << " ";
    return 0;
}`;
  }
  if (lang === 'c') {
    return `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40};
    for (int i = 0; i < 4; i++) printf("%d ", arr[i]);
    return 0;
}`;
  }
  if (lang === 'javascript') {
    return `const arr = [10, 20, 30, 40];
arr.forEach(x => console.log(x));`;
  }

  return fallbackCode || MULTI_LANG_TEMPLATES['array-loop'].java;
}
