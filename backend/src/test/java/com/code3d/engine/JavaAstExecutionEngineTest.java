package com.code3d.engine;

import com.code3d.model.ExecuteResponse;
import com.code3d.model.ExecutionStep;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

public class JavaAstExecutionEngineTest {

    private final JavaAstExecutionEngine engine = new JavaAstExecutionEngine();

    /**
     * Test 1 — Variables
     * int a = 10;
     * int b = 20;
     * int c = a + b;
     * Expected: a = 10, b = 20, c = 30
     */
    @Test
    public void testRequiredTest1Variables() {
        String code = """
            int a = 10;
            int b = 20;
            int c = a + b;
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        assertNotNull(steps);
        assertFalse(steps.isEmpty());

        ExecutionStep lastStep = steps.get(steps.size() - 1);
        assertEquals(10, lastStep.getVariables().get("a"));
        assertEquals(20, lastStep.getVariables().get("b"));
        assertEquals(30L, ((Number) lastStep.getVariables().get("c")).longValue());
    }

    /**
     * Test 2 — Condition
     * int x = 10;
     * if (x > 5) {
     *     System.out.println("Greater");
     * }
     * Verify condition state.
     */
    @Test
    public void testRequiredTest2Condition() {
        String code = """
            int x = 10;
            if (x > 5) {
                System.out.println("Greater");
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        boolean foundCondition = steps.stream().anyMatch(s ->
            s.getCondition() != null &&
            Boolean.TRUE.equals(s.getCondition().getResult()) &&
            s.getCondition().getExpression().contains("x > 5")
        );
        assertTrue(foundCondition, "Must evaluate condition (x > 5) to true");

        ExecutionStep lastStep = steps.get(steps.size() - 1);
        assertTrue(lastStep.getOutput().contains("Greater"));
    }

    /**
     * Test 3 — Loop
     * for (int i = 0; i < 5; i++) {
     *     System.out.println(i);
     * }
     * Verify every iteration.
     */
    @Test
    public void testRequiredTest3Loop() {
        String code = """
            for (int i = 0; i < 5; i++) {
                System.out.println(i);
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        ExecutionStep lastStep = steps.get(steps.size() - 1);
        List<String> output = lastStep.getOutput();

        assertTrue(output.contains("0"));
        assertTrue(output.contains("1"));
        assertTrue(output.contains("2"));
        assertTrue(output.contains("3"));
        assertTrue(output.contains("4"));
    }

    /**
     * Test 4 — Array
     * int[] arr = {10,20,30,40};
     * Verify: array creation, indexing, values, loop, output.
     */
    @Test
    public void testRequiredTest4Array() {
        String code = """
            int[] arr = {10, 20, 30, 40};
            for (int i = 0; i < arr.length; i++) {
                System.out.println(arr[i]);
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        boolean hasArrayInit = steps.stream().anyMatch(s -> s.getVariables() != null && s.getVariables().containsKey("arr"));
        assertTrue(hasArrayInit, "Must track array variable 'arr'");

        ExecutionStep lastStep = steps.get(steps.size() - 1);
        List<String> output = lastStep.getOutput();
        assertTrue(output.contains("10"));
        assertTrue(output.contains("20"));
        assertTrue(output.contains("30"));
        assertTrue(output.contains("40"));
    }

    /**
     * Test 5 — Method
     * static int add(int a, int b) {
     *     return a + b;
     * }
     * Verify call stack.
     */
    @Test
    public void testRequiredTest5Method() {
        String code = """
            public class Main {
                static int add(int a, int b) {
                    return a + b;
                }
                public static void main(String[] args) {
                    int result = add(10, 20);
                    System.out.println(result);
                }
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        boolean hasMethodCall = steps.stream().anyMatch(s -> "METHOD_CALL".equals(s.getEventType()));
        assertTrue(hasMethodCall, "Must generate METHOD_CALL event");

        boolean hasMethodReturn = steps.stream().anyMatch(s -> "FUNCTION_RETURN".equals(s.getEventType()));
        assertTrue(hasMethodReturn, "Must generate FUNCTION_RETURN event");

        ExecutionStep lastStep = steps.get(steps.size() - 1);
        assertEquals(30L, ((Number) lastStep.getVariables().get("result")).longValue());
        assertTrue(lastStep.getOutput().contains("30"));
    }

    /**
     * Test 6 — Recursion
     * Verify: call stack, return values, base case.
     */
    @Test
    public void testRequiredTest6Recursion() {
        String code = """
            public class Main {
                static int factorial(int n) {
                    if (n <= 1) {
                        return 1;
                    }
                    return n * factorial(n - 1);
                }
                public static void main(String[] args) {
                    int ans = factorial(4);
                    System.out.println(ans);
                }
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        long callCount = steps.stream().filter(s -> "METHOD_CALL".equals(s.getEventType())).count();
        assertTrue(callCount >= 4, "Must generate recursive METHOD_CALL events (at least 4 frames)");

        ExecutionStep lastStep = steps.get(steps.size() - 1);
        assertEquals(24L, ((Number) lastStep.getVariables().get("ans")).longValue());
        assertTrue(lastStep.getOutput().contains("24"));
    }

    /**
     * Test 7 — StudentResult
     * Verify complete execution and visualization.
     */
    @Test
    public void testRequiredTest7StudentResult() {
        String code = """
            import java.util.Scanner;

            class StudentResult {
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
            }
            """;

        // Provide custom input: Himanshu, 85, 90
        String input = "Himanshu\n85\n90";
        ExecuteResponse response = engine.execute(code, input);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        assertNotNull(steps);
        assertFalse(steps.isEmpty());

        ExecutionStep lastStep = steps.get(steps.size() - 1);
        assertEquals("Himanshu", lastStep.getVariables().get("name"));
        assertEquals(85, lastStep.getVariables().get("java"));
        assertEquals(90, lastStep.getVariables().get("python"));
        assertEquals(175L, ((Number) lastStep.getVariables().get("total")).longValue());
        assertEquals(87.5, ((Number) lastStep.getVariables().get("percentage")).doubleValue(), 0.001);

        List<String> output = lastStep.getOutput();
        assertTrue(output.contains("Student: Himanshu"));
        assertTrue(output.contains("Total: 175"));
        assertTrue(output.contains("Percentage: 87.5"));
    }

    @Test
    public void testArithmeticOperations() {
        String code = """
            int a = 15;
            int b = 4;
            int sum = a + b;
            int diff = a - b;
            int prod = a * b;
            int quot = a / b;
            int rem = a % b;
            """;
        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        ExecutionStep last = response.getSteps().get(response.getSteps().size() - 1);
        assertEquals(19L, ((Number) last.getVariables().get("sum")).longValue());
        assertEquals(11L, ((Number) last.getVariables().get("diff")).longValue());
        assertEquals(60L, ((Number) last.getVariables().get("prod")).longValue());
        assertEquals(3L, ((Number) last.getVariables().get("quot")).longValue());
        assertEquals(3L, ((Number) last.getVariables().get("rem")).longValue());
    }

    @Test
    public void testWhileLoop() {
        String code = """
            int count = 0;
            while (count < 4) {
                count++;
            }
            """;
        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        ExecutionStep last = response.getSteps().get(response.getSteps().size() - 1);
        assertEquals(4L, ((Number) last.getVariables().get("count")).longValue());
    }

    @Test
    public void testReturnValue() {
        String code = """
            public class Main {
                static int square(int x) {
                    return x * x;
                }
                public static void main(String[] args) {
                    int val = square(5);
                    System.out.println(val);
                }
            }
            """;
        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        ExecutionStep last = response.getSteps().get(response.getSteps().size() - 1);
        assertEquals(25L, ((Number) last.getVariables().get("val")).longValue());
        assertTrue(last.getOutput().contains("25"));
    }

    @Test
    public void testNestedLoop() {
        String code = """
            int total = 0;
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 2; j++) {
                    total++;
                }
            }
            """;
        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        ExecutionStep last = response.getSteps().get(response.getSteps().size() - 1);
        assertEquals(6L, ((Number) last.getVariables().get("total")).longValue());
    }

    @Test
    public void testInvalidJavaCode() {
        String invalidCode = "public class Main { void broken( { }";
        ExecuteResponse response = engine.execute(invalidCode);
        assertNotNull(response);
        assertEquals("ERROR", response.getStatus());
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().toLowerCase().contains("syntax") ||
                   response.getMessage().toLowerCase().contains("unable") ||
                   response.getMessage().toLowerCase().contains("parse"));
    }

    @Test
    public void testSecurityProtection() {
        String maliciousCode = """
            public class Main {
                public static void main(String[] args) {
                    ProcessBuilder pb = new ProcessBuilder("calc.exe");
                }
            }
            """;

        ExecuteResponse response = engine.execute(maliciousCode);
        assertNotNull(response);
        assertEquals("ERROR", response.getStatus());
        assertTrue(response.getMessage().contains("Unsupported Java construct") || response.getMessage().contains("restricted"));
    }
}
