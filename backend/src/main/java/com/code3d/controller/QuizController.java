package com.code3d.controller;

import com.code3d.entity.QuizRecord;
import com.code3d.model.QuizQuestion;
import com.code3d.repository.QuizRecordRepository;
import com.code3d.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;
    private final QuizRecordRepository quizRepo;

    public QuizController(QuizService quizService, QuizRecordRepository quizRepo) {
        this.quizService = quizService;
        this.quizRepo = quizRepo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getQuiz(@RequestParam(required = false, defaultValue = "array-loop") String conceptId) {
        List<QuizQuestion> questions = quizService.generateQuiz(conceptId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", questions);
        response.put("questions", questions);
        response.put("conceptId", conceptId);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/submit", "/attempts"})
    public ResponseEntity<Map<String, Object>> submitQuiz(@RequestBody Map<String, Object> payload) {
        String conceptId = (String) payload.getOrDefault("conceptId", "general");
        Integer score = 0;
        if (payload.get("score") instanceof Number num) {
            score = num.intValue();
        }
        Integer total = 1;
        if (payload.get("totalQuestions") instanceof Number num) {
            total = num.intValue();
        } else if (payload.get("total") instanceof Number num) {
            total = num.intValue();
        }

        QuizRecord record = quizRepo.save(new QuizRecord(conceptId, score, total));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", record);
        response.put("message", "Quiz attempt recorded successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/attempts")
    public ResponseEntity<Map<String, Object>> getAttempts() {
        List<QuizRecord> list = quizRepo.findTop20ByOrderByCompletedAtDesc();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        response.put("total", quizRepo.count());
        return ResponseEntity.ok(response);
    }
}
