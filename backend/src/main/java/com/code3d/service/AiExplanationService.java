package com.code3d.service;

import com.code3d.model.ExplainRequest;
import com.code3d.model.ExplainResponse;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AiExplanationService {

    public ExplainResponse explain(ExplainRequest request) {
        String type = request.getQueryType() != null ? request.getQueryType().toUpperCase() : "EXPLAIN_CODE";
        String level = request.getLevel() != null ? request.getLevel() : "Beginner";
        int line = request.getLineNumber() != null ? request.getLineNumber() : 6;
        String lang = request.getLanguage() != null ? request.getLanguage().toUpperCase() : "JAVA";
        String error = request.getError();
        String question = request.getQuestion();
        Map<String, Object> vars = request.getVariables();

        if (error != null && !error.isBlank()) {
            return new ExplainResponse(
                    "Debugging Guidance for " + lang + " Error: '" + error + "'. This typically occurs when accessing an uninitialized variable, out-of-bounds array index, or passing mismatched data types.",
                    "Check line " + line + ": verify that all array indices stay strictly within 0 to length - 1, and ensure scanner inputs match their expected types.",
                    "Defensive checking prevents runtime exceptions."
            );
        }

        if (question != null && !question.isBlank()) {
            String qLower = question.toLowerCase();
            if (qLower.contains("complex") || qLower.contains("time") || qLower.contains("space") || qLower.contains("big-o")) {
                boolean hasLoop = request.getCode() != null && (request.getCode().contains("for") || request.getCode().contains("while"));
                String timeComp = hasLoop ? "O(n)" : "O(1)";
                return new ExplainResponse(
                        "Complexity Analysis for " + lang + ": Time Complexity is " + timeComp + " and Auxiliary Space is O(1). The algorithm operates with linear scan mechanics over sequential memory addresses without dynamic re-allocation.",
                        "Notice that scalar loop counters require only 32 bits of stack space, giving constant O(1) space footprint.",
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

        if (vars != null && !vars.isEmpty() && ("VARIABLES".equals(type) || "EXPLAIN_VARS".equals(type))) {
            StringBuilder sb = new StringBuilder("Current Variable Snapshot: ");
            vars.forEach((k, v) -> sb.append(k).append(" = ").append(v).append(", "));
            return new ExplainResponse(
                    sb.toString(),
                    "Notice which variable was modified in the latest step.",
                    "Tracking variable mutation is key to understanding algorithm invariants."
            );
        }

        return switch (type) {
            case "WHY" -> new ExplainResponse(
                    "Why is this step executed? In " + lang + ", arrays and sequences require iterative traversal because elements are stored at contiguous offsets. The loop condition acts as an invariant safeguard preventing memory access violations.",
                    "Look at the condition: it guarantees we stop before out-of-bounds memory.",
                    "Loop invariants protect runtime memory boundaries."
            );
            case "HINT" -> new ExplainResponse(
                    "Progressive Hint: Notice how the active variable updates after the statement executes, and how the condition is re-checked immediately before accessing subsequent elements.",
                    "Hint: What would happen if the condition bounds were increased by 1?",
                    "Bounds checking occurs before element dereferencing."
            );
            case "PREDICT_NEXT" -> new ExplainResponse(
                    "Predictive Step: In the next step, the CPU will evaluate the next instruction line and mutate registers accordingly. If a loop is active, the counter will increment.",
                    "Think about the difference between pre-increment and post-increment.",
                    "Execution loop: Evaluate condition → Execute statement → Mutate state."
            );
            case "EXPLAIN_LINE" -> new ExplainResponse(
                    "Line " + line + " Explanation (" + level + ", " + lang + "): This statement evaluates expressions, updates local variables, and updates memory references.",
                    "Array lookups take O(1) time via base_address + index * element_size.",
                    "Direct index arithmetic enables O(1) random access."
            );
            default -> new ExplainResponse(
                    "Algorithm Overview (" + level + ", " + lang + "): The code defines data structures, processes input operations, and outputs results. The time complexity is based on loop iterations and data access patterns.",
                    "Arrays provide constant time access O(1) but linear time search O(n) for unsorted data.",
                    "Step through the timeline to see each line's 3D spatial transformation."
            );
        };
    }
}
