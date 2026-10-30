package com.code3d.service;

import com.code3d.model.ExplainRequest;
import com.code3d.model.ExplainResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiExplanationService {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
    private static final String FALLBACK_GROQ_MODEL = "openai/gpt-oss-20b";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(4))
            .build();

    public ExplainResponse explain(ExplainRequest request) {
        String type = request.getQueryType() != null ? request.getQueryType().toUpperCase() : "EXPLAIN_CODE";
        String level = request.getLevel() != null ? request.getLevel() : "Beginner";
        int line = request.getLineNumber() != null ? request.getLineNumber() : 1;
        String lang = request.getLanguage() != null ? request.getLanguage().toUpperCase() : "JAVA";
        String code = request.getCode() != null ? request.getCode().trim() : "";
        String error = request.getError();
        String question = request.getQuestion();
        Map<String, Object> vars = request.getVariables();

        // 1. Try Groq API if GROQ_API_KEY is configured
        String groqApiKey = getGroqApiKey();
        if (groqApiKey != null && !groqApiKey.isBlank() && !code.isBlank()) {
            ExplainResponse groqResponse = tryGroqExplanation(groqApiKey, request, level, lang);
            if (groqResponse != null) {
                return groqResponse;
            }
        }

        // 2. Error handling query
        if (error != null && !error.isBlank()) {
            return new ExplainResponse(
                    "Debugging Guidance for " + lang + " Error: '" + error + "'. This typically occurs when accessing an uninitialized variable, out-of-bounds array index, or passing mismatched data types.",
                    "Check line " + line + ": verify that all array indices stay strictly within 0 to length - 1, and ensure scanner inputs match their expected types.",
                    "Defensive checking prevents runtime exceptions."
            );
        }

        // 3. Question handling query
        if (question != null && !question.isBlank()) {
            String qLower = question.toLowerCase();
            if (qLower.contains("complex") || qLower.contains("time") || qLower.contains("space") || qLower.contains("big-o")) {
                boolean hasNestedLoop = code.contains("for") && (code.indexOf("for") != code.lastIndexOf("for"));
                boolean hasLoop = code.contains("for") || code.contains("while");
                String timeComp = hasNestedLoop ? "O(n²)" : hasLoop ? "O(n)" : "O(1)";
                return new ExplainResponse(
                        "Complexity Analysis for " + lang + ": Time Complexity is " + timeComp + " and Auxiliary Space is O(1). The algorithm operates with sequential memory scans without dynamic heap re-allocation.",
                        "Notice that scalar loop counters require minimal stack space, maintaining a constant O(1) auxiliary space footprint.",
                        "Time: " + timeComp + " | Space: O(1) | Invariant: Monotonic index increments safeguard bounded termination."
                );
            } else if (qLower.contains("edge") || qLower.contains("boundary") || qLower.contains("empty") || qLower.contains("null")) {
                return new ExplainResponse(
                        "Critical Edge Cases (" + lang + "): 1) Empty/Null array input, 2) Single element array (length == 1), 3) All-negative values, 4) Integer arithmetic overflow on 32-bit bounds.",
                        "Always implement defensive bounds verification: `if (nums == null || nums.length == 0) return 0;`.",
                        "Edge case guards prevent ArrayIndexOutOfBoundsException and NullPointerException."
                );
            } else if (qLower.contains("3d") || qLower.contains("visual") || qLower.contains("scene")) {
                return new ExplainResponse(
                        "3D Spatial Mapping: In CODE3D-AI, memory elements appear as elevated 3D geometric cylinders. Pointers (i, j, mid) orbit as illuminated metallic rings, and comparisons trigger pulsed laser beams across memory cells.",
                        "Click 'Launch in 3D' to observe live memory transitions in the WebGL canvas.",
                        "Physical 3D representation cements mental models of data structure layouts."
                );
            }

            return new ExplainResponse(
                    "AI Tutor Pedagogical Response for \"" + question + "\": In " + lang + ", variables and operations execute in deterministic sequence. At step " + (request.getStepNumber() != null ? request.getStepNumber() : line) + ", state registers mutate in stack memory and evaluate conditional invariants before branching.",
                    "Try visualizing how the variable states change in the 3D scene after each operation.",
                    "Trace individual variables to master algorithm invariants and branch logic."
            );
        }

        // 4. Variables snapshot query
        if (vars != null && !vars.isEmpty() && ("VARIABLES".equals(type) || "EXPLAIN_VARS".equals(type))) {
            StringBuilder sb = new StringBuilder("Current Variable Snapshot: ");
            vars.forEach((k, v) -> sb.append(k).append(" = ").append(v).append(", "));
            return new ExplainResponse(
                    sb.toString(),
                    "Notice which variable was modified in the latest step.",
                    "Tracking variable mutation is key to understanding algorithm invariants."
            );
        }

        // 5. Code-aware structural explanation for the submitted program
        return generateCodeAwareExplanation(type, code, lang, level, line);
    }

    private String getGroqApiKey() {
        String key = System.getenv("GROQ_API_KEY");
        if (key == null || key.isBlank()) {
            key = System.getProperty("GROQ_API_KEY");
        }
        return key != null ? key.trim() : null;
    }

    private ExplainResponse tryGroqExplanation(String apiKey, ExplainRequest request, String level, String lang) {
        try {
            String prompt = "You are the CODE3D-AI Tutor. Explain the following " + lang + " code for a " + level + " student.\n" +
                    "Explain what the code does, its key comparisons, loop behavior, variables, and time/space complexity.\n\n" +
                    "CODE:\n" + request.getCode() + "\n\n" +
                    "Return a JSON object with strictly these keys: explanation (detailed string), hint (helpful tip string), keyTakeaway (key concept string). Do not wrap in markdown fences.";

            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", DEFAULT_GROQ_MODEL,
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are an expert programming instructor. Return strictly valid JSON with keys: explanation, hint, keyTakeaway."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.2,
                    "response_format", Map.of("type", "json_object")
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(6))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                JsonNode parsedContent = objectMapper.readTree(content);

                String explanation = parsedContent.path("explanation").asText("");
                String hint = parsedContent.path("hint").asText("");
                String keyTakeaway = parsedContent.path("keyTakeaway").asText("");

                if (!explanation.isBlank()) {
                    return new ExplainResponse(explanation, hint, keyTakeaway);
                }
            }
        } catch (Exception e) {
            // Gracefully fall through to deterministic code-aware analyzer
        }
        return null;
    }

    private ExplainResponse generateCodeAwareExplanation(String type, String code, String lang, String level, int line) {
        boolean isBubbleSort = code.toLowerCase().contains("bubble") ||
                (code.contains("[j]") && code.contains("[j+1]") && code.contains("temp"));
        boolean isBinarySearch = code.toLowerCase().contains("binary") ||
                (code.contains("low") && code.contains("high") && code.contains("mid"));
        boolean hasNestedLoop = code.contains("for") && (code.indexOf("for") != code.lastIndexOf("for"));
        boolean hasLoop = code.contains("for") || code.contains("while");

        if (isBubbleSort) {
            return switch (type) {
                case "WHY" -> new ExplainResponse(
                        "Why compare arr[j] and arr[j+1]? Bubble Sort works by checking adjacent pairs. If the left element exceeds the right element, they are out of order and must be swapped so larger values bubble rightward.",
                        "The inner loop runs up to n - i - 1 because the largest i elements have already settled at the end.",
                        "Adjacent comparisons guarantee local order, which accumulates into global array sortedness."
                );
                case "HINT" -> new ExplainResponse(
                        "Notice the condition arr[j] > arr[j+1]. Swapping when strictly greater makes Bubble Sort a stable sorting algorithm because equal elements never switch places.",
                        "What would happen if you changed the operator to >=? Stability would be lost.",
                        "Preserving relative order of identical elements defines sorting stability."
                );
                case "EXPLAIN_LINE" -> new ExplainResponse(
                        "Line " + line + " in Bubble Sort: This statement is part of the adjacent comparison and swap sequence (`temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;`) which shifts heavier elements to higher indices.",
                        "Each swap requires 3 assignments using a temporary variable.",
                        "Three-step swap ensures no element value is overwritten before being safely copied."
                );
                default -> new ExplainResponse(
                        "Bubble Sort Algorithm (" + level + ", " + lang + "): The program sorts an array of integers by repeatedly iterating through adjacent pairs `arr[j]` and `arr[j+1]`. When `arr[j] > arr[j+1]`, the elements swap places. The outer loop index `i` tracks completed passes, while the inner loop index `j` sweeps through remaining unsorted pairs, bubbling the largest value to the end each pass.",
                        "After pass i, the last i elements are guaranteed in final sorted position, so inner loop bound `n - i - 1` avoids redundant comparisons.",
                        "Time: O(n²) worst/average, O(n) best | Space: O(1) in-place | Stability: Stable"
                );
            };
        }

        if (isBinarySearch) {
            return new ExplainResponse(
                    "Binary Search Algorithm (" + level + ", " + lang + "): The code searches a sorted array in logarithmic time by repeatedly dividing the search space in half. It calculates the middle index `mid = low + (high - low) / 2` and compares `arr[mid]` to the target value.",
                    "Halving the interval each iteration reduces remaining candidates from n to n/2 to n/4 down to 1.",
                    "Time: O(log n) | Auxiliary Space: O(1) iterative | Precondition: Array must be sorted"
            );
        }

        if (hasNestedLoop) {
            return new ExplainResponse(
                    "Nested Iteration Algorithm (" + level + ", " + lang + "): The program executes an outer loop and an inner loop, examining combinations or pairs of elements across the collection. For each pass of the outer counter, the inner loop performs multiple operations.",
                    "Quadratic operations grow rapidly with input size n.",
                    "Time: O(n²) | Auxiliary Space: O(1) | Invariant: Bounded iteration guarantees termination."
            );
        }

        if (hasLoop) {
            return new ExplainResponse(
                    "Linear Iteration Algorithm (" + level + ", " + lang + "): The program traverses elements sequentially from index 0 to length - 1, processing each item in constant time per iteration.",
                    "Linear scans access sequential memory addresses with high cache locality.",
                    "Time: O(n) | Auxiliary Space: O(1) | Access: Sequential O(1) per step"
            );
        }

        return new ExplainResponse(
                "Sequential Program Execution (" + level + ", " + lang + "): The code executes statements sequentially, initializing data structures and computing operations in stack memory.",
                "Direct variable declarations and arithmetic execute in deterministic constant time.",
                "Time: O(1) | Auxiliary Space: O(1) | Flow: Deterministic instruction sequence"
        );
    }
}

