import { useState, useEffect, useRef, useCallback } from 'react';
import { BreathEngine, BreathConfig, BreathState } from '../engine/BreathEngine';

export const defaultBreathConfig: BreathConfig = {
  inhale: 4,
  hold: 4,
  exhale: 6,
  rest: 2,
  cycles: 5,
};

export const useBreathingController = (config: BreathConfig = defaultBreathConfig) => {
  const [state, setState] = useState<BreathState>({
    phase: 'IDLE',
    timeRemaining: 0,
    cycle: 1,
    progress: 0,
  });

  const engineRef = useRef<BreathEngine | null>(null);

  useEffect(() => {
    engineRef.current = new BreathEngine(
      config,
      (newState) => {
        // use function update to avoid missing intermediate fast ticks if any
        setState(prev => ({ ...prev, ...newState }));
      },
      () => {
        // onComplete
      }
    );

    return () => {
      engineRef.current?.stop();
    };
  }, [config]);

  const start = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  return {
    state,
    start,
    stop,
    pause,
    resume,
  };
};
