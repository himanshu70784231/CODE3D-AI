package com.code3d.controller;

import com.code3d.entity.ProgramRecord;
import com.code3d.repository.ProgramRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/programs", "/api/saved"})
public class ProgramRecordController {

    private final ProgramRepository programRepo;

    public ProgramRecordController(ProgramRepository programRepo) {
        this.programRepo = programRepo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPrograms() {
        List<ProgramRecord> list = programRepo.findTop20ByOrderByCreatedAtDesc();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        response.put("saved", list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProgramById(@PathVariable Long id) {
        Optional<ProgramRecord> record = programRepo.findById(id);
        Map<String, Object> response = new HashMap<>();
        if (record.isPresent()) {
            response.put("success", true);
            response.put("data", record.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "Program not found with id: " + id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProgram(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("title", "Saved Program");
        String description = (String) payload.getOrDefault("description", "");
        String code = (String) payload.getOrDefault("code", "");
        String language = (String) payload.getOrDefault("language", "java");
        String timeComplexity = (String) payload.getOrDefault("timeComplexity", "O(n)");
        String spaceComplexity = (String) payload.getOrDefault("spaceComplexity", "O(1)");

        ProgramRecord record = new ProgramRecord(
                null,
                title,
                description,
                code,
                language,
                timeComplexity,
                spaceComplexity
        );

        ProgramRecord saved = programRepo.save(record);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProgram(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<ProgramRecord> opt = programRepo.findById(id);
        Map<String, Object> response = new HashMap<>();
        if (opt.isPresent()) {
            ProgramRecord record = opt.get();
            if (payload.containsKey("title")) record.setTitle((String) payload.get("title"));
            if (payload.containsKey("description")) record.setDescription((String) payload.get("description"));
            if (payload.containsKey("code")) record.setCode((String) payload.get("code"));
            if (payload.containsKey("language")) record.setLanguage((String) payload.get("language"));
            if (payload.containsKey("timeComplexity")) record.setTimeComplexity((String) payload.get("timeComplexity"));
            if (payload.containsKey("spaceComplexity")) record.setSpaceComplexity((String) payload.get("spaceComplexity"));
            record.setUpdatedAt(LocalDateTime.now());

            ProgramRecord saved = programRepo.save(record);
            response.put("success", true);
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "Program not found with id: " + id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProgram(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (programRepo.existsById(id)) {
            programRepo.deleteById(id);
            response.put("success", true);
            response.put("message", "Program deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "Program not found with id: " + id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
