package com.code3d.controller;

import com.code3d.entity.ExecutionRecord;
import com.code3d.entity.ProgramRecord;
import com.code3d.entity.QuizRecord;
import com.code3d.repository.ExecutionRepository;
import com.code3d.repository.ProgramRepository;
import com.code3d.repository.QuizRecordRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final ExecutionRepository executionRepo;
    private final ProgramRepository programRepo;
    private final QuizRecordRepository quizRepo;

    public HistoryController(ExecutionRepository executionRepo,
                             ProgramRepository programRepo,
                             QuizRecordRepository quizRepo) {
        this.executionRepo = executionRepo;
        this.programRepo = programRepo;
        this.quizRepo = quizRepo;
    }

    @PostConstruct
    public void seedInitialData() {
        if (executionRepo.count() == 0) {
            executionRepo.save(new ExecutionRecord("Array Traversal & Print", "array-loop", 16, "COMPLETED"));
            executionRepo.save(new ExecutionRecord("Bubble Sort Algorithm", "bubble-sort", 14, "COMPLETED"));
            executionRepo.save(new ExecutionRecord("Stack LIFO Operations", "stack", 5, "COMPLETED"));
            executionRepo.save(new ExecutionRecord("Binary Search O(log n)", "binary-search", 4, "COMPLETED"));
        }

        if (quizRepo.count() == 0) {
            quizRepo.save(new QuizRecord("array-loop", 3, 3));
            quizRepo.save(new QuizRecord("stack", 2, 2));
            quizRepo.save(new QuizRecord("bst", 2, 2));
        }

        if (programRepo.count() == 0) {
            programRepo.save(new ProgramRecord("Default Array Loop",
                    "public class Main {\n    public static void main(String[] args) {\n        int[] arr = {10, 20, 30, 40};\n    }\n}",
                    "java", "O(n)", "O(1)"));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHistorySummary() {
        Map<String, Object> data = new HashMap<>();
        List<ExecutionRecord> recent = executionRepo.findTop20ByOrderByExecutedAtDesc();
        data.put("recentExecutions", recent);
        data.put("items", recent);
        data.put("savedPrograms", programRepo.findTop20ByOrderByCreatedAtDesc());
        data.put("recentQuizzes", quizRepo.findTop20ByOrderByCompletedAtDesc());
        data.put("totalExecutionsCount", executionRepo.count());
        data.put("totalQuizzesTaken", quizRepo.count());
        data.put("isBackendConnected", true);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExecutionRecord> getHistoryById(@PathVariable Long id) {
        return executionRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ExecutionRecord> createHistory(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("programTitle", payload.getOrDefault("title", "Java Program"));
        String conceptId = (String) payload.getOrDefault("conceptId", "custom");
        String language = (String) payload.getOrDefault("language", "java");
        String code = (String) payload.getOrDefault("code", "");
        Integer steps = payload.get("totalSteps") instanceof Number ? ((Number) payload.get("totalSteps")).intValue() : 1;
        String status = (String) payload.getOrDefault("status", "COMPLETED");
        Long executionTimeMs = payload.get("executionTimeMs") instanceof Number ? ((Number) payload.get("executionTimeMs")).longValue() : 0L;
        String error = (String) payload.get("error");

        ExecutionRecord record = new ExecutionRecord(
                null,
                title,
                conceptId,
                language,
                code,
                steps,
                status,
                executionTimeMs,
                error
        );

        return ResponseEntity.ok(executionRepo.save(record));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteHistoryById(@PathVariable Long id) {
        if (!executionRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        executionRepo.deleteById(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "History record " + id + " deleted successfully.");
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearAllHistory() {
        executionRepo.deleteAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "All execution history records cleared.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/execution")
    public ResponseEntity<ExecutionRecord> recordExecution(@RequestBody Map<String, Object> payload) {
        return createHistory(payload);
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizRecord> recordQuiz(@RequestBody Map<String, Object> payload) {
        String conceptId = (String) payload.getOrDefault("conceptId", "general");
        Integer score = (Integer) payload.getOrDefault("score", 0);
        Integer total = (Integer) payload.getOrDefault("totalQuestions", 1);

        QuizRecord record = quizRepo.save(new QuizRecord(conceptId, score, total));
        return ResponseEntity.ok(record);
    }
}
