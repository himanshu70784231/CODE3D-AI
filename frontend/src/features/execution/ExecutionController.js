/**
 * CODE3D-AI - Execution Lifecycle State Machine
 * 
 * Compliant with Section 34 specification:
 * States: IDLE | ANALYZING | READY | RUNNING | PAUSED | COMPLETED | ERROR
 */

export const ExecutionState = {
  IDLE: 'IDLE',
  ANALYZING: 'ANALYZING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
};

export class ExecutionController {
  constructor({ onStateChange, onTraceReady, onError }) {
    this.currentState = ExecutionState.IDLE;
    this.onStateChange = onStateChange || (() => {});
    this.onTraceReady = onTraceReady || (() => {});
    this.onError = onError || (() => {});
    this.activeRunId = 0;
  }

  setState(newState, payload = {}) {
    this.currentState = newState;
    this.onStateChange(newState, payload);
  }

  getState() {
    return this.currentState;
  }

  isExecuting() {
    return this.currentState === ExecutionState.ANALYZING;
  }

  startAnalysis() {
    this.activeRunId++;
    const runId = this.activeRunId;
    this.setState(ExecutionState.ANALYZING, { runId });
    return runId;
  }

  setReady(trace, runId) {
    if (runId !== this.activeRunId) return; // Stale execution result
    this.setState(ExecutionState.READY, { trace });
    this.onTraceReady(trace);
  }

  setError(error, runId) {
    if (runId !== this.activeRunId) return;
    this.setState(ExecutionState.ERROR, { error });
    this.onError(error);
  }

  setPlaying() {
    this.setState(ExecutionState.RUNNING);
  }

  setPaused() {
    this.setState(ExecutionState.PAUSED);
  }

  setCompleted() {
    this.setState(ExecutionState.COMPLETED);
  }

  reset() {
    this.activeRunId++;
    this.setState(ExecutionState.IDLE);
  }
}

export default ExecutionController;
