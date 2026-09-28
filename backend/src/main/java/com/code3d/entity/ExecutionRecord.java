package com.code3d.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "execution_history")
public class ExecutionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String programTitle;
    private String conceptId;
    private String language;

    @Column(columnDefinition = "TEXT")
    private String code;

    private Integer totalSteps;
    private String status;
    private Long executionTimeMs;
    private String error;
    private LocalDateTime executedAt;

    public ExecutionRecord() {
        this.executedAt = LocalDateTime.now();
    }

    public ExecutionRecord(String programTitle, String conceptId, Integer totalSteps, String status) {
        this.programTitle = programTitle;
        this.conceptId = conceptId;
        this.totalSteps = totalSteps;
        this.status = status;
        this.language = "java";
        this.executedAt = LocalDateTime.now();
    }

    public ExecutionRecord(Long userId, String programTitle, String conceptId, String language, String code, Integer totalSteps, String status, Long executionTimeMs, String error) {
        this.userId = userId;
        this.programTitle = programTitle;
        this.conceptId = conceptId;
        this.language = language;
        this.code = code;
        this.totalSteps = totalSteps;
        this.status = status;
        this.executionTimeMs = executionTimeMs;
        this.error = error;
        this.executedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getProgramTitle() { return programTitle; }
    public void setProgramTitle(String programTitle) { this.programTitle = programTitle; }

    public String getConceptId() { return conceptId; }
    public void setConceptId(String conceptId) { this.conceptId = conceptId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getTotalSteps() { return totalSteps; }
    public void setTotalSteps(Integer totalSteps) { this.totalSteps = totalSteps; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
