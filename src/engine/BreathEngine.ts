export type BreathPhase = 'IDLE' | 'INHALE' | 'HOLD' | 'EXHALE' | 'REST' | 'COMPLETE';

export interface BreathConfig {
  inhale: number; // seconds
  hold: number;
  exhale: number;
  rest: number;
  cycles: number;
}

export interface BreathState {
  phase: BreathPhase;
  timeRemaining: number;
  cycle: number;
  progress: number; // 0 to 1 scaling based on time remaining in INHALE/EXHALE
}

export type BreathUpdateCallback = (state: BreathState) => void;
export type BreathCompleteCallback = () => void;

export class BreathEngine {
  private config: BreathConfig;
  private onUpdate: BreathUpdateCallback;
  private onComplete: BreathCompleteCallback;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  
  private currentState: BreathState = {
    phase: 'IDLE',
    timeRemaining: 0,
    cycle: 1,
    progress: 0,
  };

  private phaseEndTime: number = 0;

  constructor(
    config: BreathConfig,
    onUpdate: BreathUpdateCallback,
    onComplete: BreathCompleteCallback
  ) {
    this.config = config;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  start() {
    if (this.intervalId) return;
    this.currentState.cycle = 1;
    this.transitionTo('INHALE');
    this.intervalId = setInterval(() => this.tick(), 100);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentState = { ...this.currentState, phase: 'IDLE', timeRemaining: 0, progress: 0 };
    this.onUpdate(this.currentState);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume() {
    if (!this.intervalId && this.currentState.phase !== 'IDLE' && this.currentState.phase !== 'COMPLETE') {
      // Adjust phase end time based on the paused duration remainder.
      this.phaseEndTime = Date.now() + this.currentState.timeRemaining * 1000;
      this.intervalId = setInterval(() => this.tick(), 100);
    }
  }

  private transitionTo(phase: BreathPhase) {
    this.currentState.phase = phase;
    let duration = 0;

    switch (phase) {
      case 'INHALE': duration = this.config.inhale; break;
      case 'HOLD': duration = this.config.hold; break;
      case 'EXHALE': duration = this.config.exhale; break;
      case 'REST': duration = this.config.rest; break;
      case 'COMPLETE': 
        this.stop();
        this.onComplete();
        return;
    }

    this.currentState.timeRemaining = duration;
    this.phaseEndTime = Date.now() + duration * 1000;
    this.calculateProgress();
    this.onUpdate(this.currentState);
  }

  private tick() {
    const now = Date.now();
    const remainingMs = this.phaseEndTime - now;

    if (remainingMs <= 0) {
      this.advancePhase();
    } else {
      this.currentState.timeRemaining = Math.max(0, remainingMs / 1000);
      this.calculateProgress();
      this.onUpdate(this.currentState);
    }
  }

  private calculateProgress() {
    const { phase, timeRemaining } = this.currentState;
    
    switch (phase) {
      case 'INHALE':
        // Progress goes from 0 to 1
        this.currentState.progress = 1 - (timeRemaining / this.config.inhale);
        break;
      case 'HOLD':
        // Stay at 1
        this.currentState.progress = 1;
        break;
      case 'EXHALE':
        // Progress goes from 1 to 0
        this.currentState.progress = timeRemaining / this.config.exhale;
        break;
      case 'REST':
      case 'IDLE':
      case 'COMPLETE':
        // Stay at 0
        this.currentState.progress = 0;
        break;
    }
  }

  private advancePhase() {
    switch (this.currentState.phase) {
      case 'INHALE':
        this.transitionTo(this.config.hold > 0 ? 'HOLD' : 'EXHALE');
        break;
      case 'HOLD':
        this.transitionTo('EXHALE');
        break;
      case 'EXHALE':
        this.transitionTo(this.config.rest > 0 ? 'REST' : 'INHALE');
        if (this.config.rest === 0) this.checkCycleComplete();
        break;
      case 'REST':
        this.checkCycleComplete();
        break;
      default:
        break;
    }
  }

  private checkCycleComplete() {
    if (this.currentState.cycle >= this.config.cycles) {
      this.transitionTo('COMPLETE');
      this.currentState.phase = 'COMPLETE';
      this.onUpdate(this.currentState);
    } else {
      this.currentState.cycle += 1;
      this.transitionTo('INHALE');
    }
  }

  getConfig() {
    return this.config;
  }
}
