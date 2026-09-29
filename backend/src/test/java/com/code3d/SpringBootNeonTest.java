package com.code3d;

import com.code3d.config.EnvLoader;
import com.code3d.repository.ExecutionRepository;
import com.code3d.repository.ProgramRepository;
import com.code3d.repository.QuizRecordRepository;
import com.code3d.repository.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SpringBootNeonTest {

    @BeforeAll
    public static void setup() {
        EnvLoader.load();
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExecutionRepository executionRepository;

    @Autowired
    private QuizRecordRepository quizRecordRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Test
    public void testCheckAllData() {
        assertNotNull(userRepository);
        System.out.println("\n====================== NEON DATABASE INSPECTION ======================");

        System.out.println("\n--- [1] USERS (Total: " + userRepository.count() + ") ---");
        userRepository.findAll().forEach(u ->
            System.out.printf("  [User #%d] username=%s | email=%s | role=%s | created=%s%n",
                u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getCreatedAt())
        );

        System.out.println("\n--- [2] EXECUTION HISTORY (Total: " + executionRepository.count() + ") ---");
        executionRepository.findAll().forEach(e ->
            System.out.printf("  [Execution #%d] lang=%s | title=%s | concept=%s | steps=%s | status=%s | time=%s%n",
                e.getId(), e.getLanguage(), e.getProgramTitle(), e.getConceptId(), e.getTotalSteps(), e.getStatus(), e.getExecutedAt())
        );

        System.out.println("\n--- [3] QUIZ RECORDS (Total: " + quizRecordRepository.count() + ") ---");
        quizRecordRepository.findAll().forEach(q ->
            System.out.printf("  [Quiz #%d] concept=%s | score=%d/%d | accuracy=%d%% | time=%s%n",
                q.getId(), q.getConceptId(), q.getScore(), q.getTotalQuestions(), q.getAccuracy(), q.getCompletedAt())
        );

        System.out.println("\n--- [4] SAVED PROGRAMS (Total: " + programRepository.count() + ") ---");
        programRepository.findAll().forEach(p ->
            System.out.printf("  [Program #%d] title='%s' | lang=%s | updated=%s%n",
                p.getId(), p.getTitle(), p.getLanguage(), p.getUpdatedAt())
        );

        System.out.println("======================================================================\n");
    }
}

