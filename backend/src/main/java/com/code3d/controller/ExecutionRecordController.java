package com.code3d.controller;

import com.code3d.entity.ExecutionRecord;
import com.code3d.repository.ExecutionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/executions")
public class ExecutionRecordController {

    private final ExecutionRepository executionRepo;

    public ExecutionRecordController(ExecutionRepository executionRepo) {
        this.executionRepo = executionRepo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllExecutions(@RequestParam(value = "language", required = false) String language,
                                                               @RequestParam(value = "search", required = false) String search) {
        List<ExecutionRecord> list = executionRepo.findTop20ByOrderByExecutedAtDesc();
        if (language != null && !language.isBlank()) {
            list = list.stream().filter(e -> language.equalsIgnoreCase(e.getLanguage())).toList();
        }
        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            list = list.stream().filter(e -> (e.getProgramTitle() != null && e.getProgramTitle().toLowerCase().contains(lower)) ||
                                             (e.getConceptId() != null && e.getConceptId().toLowerCase().contains(lower))).toList();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        response.put("total", executionRepo.count());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getExecutionById(@PathVariable Long id) {
        Optional<ExecutionRecord> record = executionRepo.findById(id);
        Map<String, Object> response = new HashMap<>();
        if (record.isPresent()) {
            response.put("success", true);
            response.put("data", record.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "Execution record not found with id: " + id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteExecution(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (executionRepo.existsById(id)) {
            executionRepo.deleteById(id);
            response.put("success", true);
            response.put("message", "Execution record deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "Execution record not found with id: " + id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createExecution(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("programTitle", "Execution Run");
        String conceptId = (String) payload.getOrDefault("conceptId", "custom");
        String language = (String) payload.getOrDefault("language", "java");
        String code = (String) payload.getOrDefault("code", "");
        Integer totalSteps = (Integer) payload.getOrDefault("totalSteps", 1);
        String status = (String) payload.getOrDefault("status", "COMPLETED");
        String error = (String) payload.getOrDefault("error", null);

        ExecutionRecord record = new ExecutionRecord(
                null,
                title,
                conceptId,
                language,
                code,
                totalSteps,
                status,
                null,
                error
        );

        ExecutionRecord saved = executionRepo.save(record);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
