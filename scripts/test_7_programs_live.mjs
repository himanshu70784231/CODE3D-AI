// Test All 7 Required Programs over HTTP against live Spring Boot backend
const BASE_URL = 'http://localhost:8080/api/execute';

async function testAllPrograms() {
  console.log('Verifying all 7 required test programs against live engine at:', BASE_URL);

  const tests = [
    {
      id: 'Test 1 — Variables',
      code: `public class Test1 {
        public static void main(String[] args) {
          int a = 10;
          int b = 20;
          int c = a + b;
        }
      }`,
      validate: (steps) => {
        const last = steps[steps.length - 1];
        if (last.variables?.a !== 10 || last.variables?.b !== 20 || last.variables?.c !== 30) {
          throw new Error(`Expected a=10, b=20, c=30, got: ${JSON.stringify(last.variables)}`);
        }
      }
    },
    {
      id: 'Test 2 — Condition',
      code: `public class Test2 {
        public static void main(String[] args) {
          int x = 10;
          if (x > 5) {
            System.out.println("Greater");
          }
        }
      }`,
      validate: (steps) => {
        const condStep = steps.find(s => s.condition !== null && s.condition !== undefined);
        if (!condStep || condStep.condition.result !== true) {
          throw new Error('Condition step (x > 5) not evaluated as true');
        }
        const last = steps[steps.length - 1];
        if (!last.output || !last.output.some(o => o.includes('Greater'))) {
          throw new Error('Expected output "Greater" not found');
        }
      }
    },
    {
      id: 'Test 3 — Loop',
      code: `public class Test3 {
        public static void main(String[] args) {
          for (int i = 0; i < 5; i++) {
            System.out.println(i);
          }
        }
      }`,
      validate: (steps) => {
        const last = steps[steps.length - 1];
        if (!last.output || last.output.length < 5) {
          throw new Error(`Expected at least 5 loop outputs, got ${last.output?.length}`);
        }
      }
    },
    {
      id: 'Test 4 — Array',
      code: `public class Test4 {
        public static void main(String[] args) {
          int[] arr = {10, 20, 30, 40};
          for (int i = 0; i < arr.length; i++) {
            System.out.println(arr[i]);
          }
        }
      }`,
      validate: (steps) => {
        const arrayStep = steps.find(s => s.dataStructureState && s.dataStructureState.values?.length === 4);
        if (!arrayStep) throw new Error('Array dataStructureState not captured');
        const last = steps[steps.length - 1];
        if (!last.output || !last.output.some(o => o.includes('40'))) {
          throw new Error('Expected array output element 40');
        }
      }
    },
    {
      id: 'Test 5 — Method Call Stack',
      code: `public class Test5 {
        static int add(int a, int b) {
          return a + b;
        }
        public static void main(String[] args) {
          int result = add(10, 20);
          System.out.println(result);
        }
      }`,
      validate: (steps) => {
        const inMethod = steps.find(s => s.callStack && s.callStack.some(f => f.includes('add')));
        if (!inMethod) throw new Error('Call stack frame for add() not observed');
        const last = steps[steps.length - 1];
        if (!last.output || !last.output.some(o => o.includes('30'))) {
          throw new Error('Expected method result output 30');
        }
      }
    },
    {
      id: 'Test 6 — Recursion Call Stack',
      code: `public class Test6 {
        static int factorial(int n) {
          if (n <= 1) return 1;
          return n * factorial(n - 1);
        }
        public static void main(String[] args) {
          int ans = factorial(4);
          System.out.println(ans);
        }
      }`,
      validate: (steps) => {
        const deepCall = steps.find(s => s.callStack && s.callStack.length >= 3);
        if (!deepCall) throw new Error('Recursive stack depth >= 3 not observed');
        const last = steps[steps.length - 1];
        if (!last.output || !last.output.some(o => o.includes('24'))) {
          throw new Error('Expected factorial(4) output 24');
        }
      }
    },
    {
      id: 'Test 7 — StudentResult (Scanner input + calculations)',
      code: `import java.util.Scanner;
      public class StudentResult {
        public static void main(String[] args) {
          Scanner sc = new Scanner(System.in);
          System.out.print("Enter student name: ");
          String name = sc.nextLine();
          System.out.print("Enter marks in Java: ");
          int java = sc.nextInt();
          System.out.print("Enter marks in Python: ");
          int python = sc.nextInt();
          int total = java + python;
          double percentage = total / 2.0;
          System.out.println("Student: " + name);
          System.out.println("Total: " + total);
          System.out.println("Percentage: " + percentage);
        }
      }`,
      input: 'Himanshu\n85\n90',
      validate: (steps) => {
        const last = steps[steps.length - 1];
        const outStr = (last.output || []).join('\n');
        if (!outStr.includes('Himanshu') || !outStr.includes('175') || !outStr.includes('87.5')) {
          throw new Error(`Expected Student: Himanshu, Total: 175, Percentage: 87.5. Got output:\n${outStr}`);
        }
      }
    }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: t.code,
          language: 'java',
          input: t.input || null,
          title: t.id,
        })
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.steps) || data.steps.length === 0) {
        throw new Error(data.error || 'Execution response missing steps');
      }
      t.validate(data.steps);
      console.log(`  ✔ PASS: ${t.id} (${data.steps.length} execution steps verified)`);
      passed++;
    } catch (err) {
      console.error(`  ✘ FAIL: ${t.id}:`, err.message);
    }
  }

  console.log(`\nResult: ${passed}/7 Required Test Programs PASSED!`);
  if (passed !== 7) process.exit(1);
}

testAllPrograms().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
