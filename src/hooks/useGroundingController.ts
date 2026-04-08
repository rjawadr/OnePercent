import { useState, useEffect, useRef, useCallback } from 'react';
import { GroundingEngine, GroundingState, GroundingUpdateCallback } from '../engine/GroundingEngine';

export const useGroundingController = () => {
  const [state, setState] = useState<GroundingState>({
    currentStepIndex: 0,
    isComplete: false,
    totalSteps: 5,
    currentStep: null,
  });

  const engineRef = useRef<GroundingEngine | null>(null);

  useEffect(() => {
    engineRef.current = new GroundingEngine(
      (newState) => {
        setState({ ...newState });
      },
      () => {
        // onComplete
      }
    );
    // Initialize state
    engineRef.current.start();
  }, []);

  const nextStep = useCallback(() => {
    engineRef.current?.nextStep();
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  return {
    state,
    nextStep,
    reset,
  };
};
