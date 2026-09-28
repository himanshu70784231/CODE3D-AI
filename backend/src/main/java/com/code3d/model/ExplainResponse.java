package com.code3d.model;

import java.util.HashMap;
import java.util.Map;

public class ExplainResponse {
    private boolean success;
    private String explanation;
    private String hint;
    private String keyTakeaway;
    private Map<String, Object> data;

    public ExplainResponse() {
        this.success = true;
    }

    public ExplainResponse(String explanation, String hint, String keyTakeaway) {
        this.success = true;
        this.explanation = explanation;
        this.hint = hint;
        this.keyTakeaway = keyTakeaway;
        this.data = new HashMap<>();
        this.data.put("explanation", explanation);
        this.data.put("hint", hint);
        this.data.put("keyTakeaway", keyTakeaway);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) {
        this.explanation = explanation;
        if (this.data == null) this.data = new HashMap<>();
        this.data.put("explanation", explanation);
    }

    public String getHint() { return hint; }
    public void setHint(String hint) {
        this.hint = hint;
        if (this.data == null) this.data = new HashMap<>();
        this.data.put("hint", hint);
    }

    public String getKeyTakeaway() { return keyTakeaway; }
    public void setKeyTakeaway(String keyTakeaway) {
        this.keyTakeaway = keyTakeaway;
        if (this.data == null) this.data = new HashMap<>();
        this.data.put("keyTakeaway", keyTakeaway);
    }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
