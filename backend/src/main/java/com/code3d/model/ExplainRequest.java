package com.code3d.model;

import java.util.Map;

public class ExplainRequest {
    private String code;
    private String language;
    private Integer lineNumber;
    private Integer stepNumber;
    private String queryType; // EXPLAIN_CODE, EXPLAIN_LINE, WHY, HINT, PREDICT_NEXT, DEBUG_ERROR, ASK_QUESTION
    private String level;     // Beginner, Intermediate, DSA
    private String question;
    private String error;
    private Map<String, Object> variables;

    public ExplainRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public String getQueryType() { return queryType; }
    public void setQueryType(String queryType) { this.queryType = queryType; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public Map<String, Object> getVariables() { return variables; }
    public void setVariables(Map<String, Object> variables) { this.variables = variables; }
}
