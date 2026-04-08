export interface GroundingStep {
  label: string;
  count: number;
  instruction: string;
}

export interface GroundingState {
  currentStepIndex: number;
  isComplete: boolean;
  totalSteps: number;
  currentStep: GroundingStep | null;
}

export type GroundingUpdateCallback = (state: GroundingState) => void;
export type GroundingCompleteCallback = () => void;

const DEFAULT_STEPS: GroundingStep[] = [
  { label: 'See', count: 5, instruction: 'Notice 5 things you can see around you.' },
  { label: 'Feel', count: 4, instruction: 'Notice 4 things you can physically feel.' },
  { label: 'Hear', count: 3, instruction: 'Notice 3 things you can hear right now.' },
  { label: 'Smell', count: 2, instruction: 'Notice 2 things you can smell.' },
  { label: 'Taste', count: 1, instruction: 'Notice 1 thing you can taste.' },
];

export class GroundingEngine {
  private steps: GroundingStep[];
  private onUpdate: GroundingUpdateCallback;
  private onComplete: GroundingCompleteCallback;
  
  private currentState: GroundingState;

  constructor(
    onUpdate: GroundingUpdateCallback,
    onComplete: GroundingCompleteCallback,
    customSteps?: GroundingStep[]
  ) {
    this.steps = customSteps || DEFAULT_STEPS;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.currentState = {
      currentStepIndex: 0,
      isComplete: false,
      totalSteps: this.steps.length,
      currentStep: this.steps[0] || null,
    };
  }

  start() {
    this.currentState = {
      currentStepIndex: 0,
      isComplete: false,
      totalSteps: this.steps.length,
      currentStep: this.steps[0] || null,
    };
    this.onUpdate(this.currentState);
  }

  nextStep() {
    if (this.currentState.isComplete) return;

    const nextIndex = this.currentState.currentStepIndex + 1;
    if (nextIndex >= this.steps.length) {
      this.currentState = {
        ...this.currentState,
        isComplete: true,
        currentStep: null,
      };
      this.onUpdate(this.currentState);
      this.onComplete();
    } else {
      this.currentState = {
        ...this.currentState,
        currentStepIndex: nextIndex,
        currentStep: this.steps[nextIndex],
      };
      this.onUpdate(this.currentState);
    }
  }

  reset() {
    this.start();
  }
}
