import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import Sound from 'react-native-sound';

// Tell the library to use the Android raw resource bundle
Sound.setCategory('Playback', true /* mixWithOthers */);

type Phase = string;

/**
 * Plays a short rising chime on INHALE and a falling chime on EXHALE.
 * Stays silent during HOLD / REST / IDLE / COMPLETE.
 */
export const useBreathSounds = (phase: Phase, enabled = true) => {
  const inhaleSound = useRef<Sound | null>(null);
  const exhaleSound = useRef<Sound | null>(null);
  const inhaleReady = useRef(false);
  const exhaleReady = useRef(false);
  const prevPhase   = useRef<Phase>('IDLE');

  // Load sounds once on mount
  useEffect(() => {
    inhaleSound.current = new Sound(
      'breath_in.wav',
      Sound.MAIN_BUNDLE,
      (err) => {
        if (err) {
          console.warn('[BreathSounds] inhale load error:', err);
        } else {
          inhaleReady.current = true;
          // If we loaded and are already in INHALE, play now
          if (phase === 'INHALE' && enabled) {
            inhaleSound.current?.play();
          }
        }
      },
    );
    exhaleSound.current = new Sound(
      'breath_out.wav',
      Sound.MAIN_BUNDLE,
      (err) => {
        if (err) {
          console.warn('[BreathSounds] exhale load error:', err);
        } else {
          exhaleReady.current = true;
          // If we loaded and are already in EXHALE, play now
          if (phase === 'EXHALE' && enabled) {
            exhaleSound.current?.play();
          }
        }
      },
    );

    return () => {
      inhaleSound.current?.release();
      exhaleSound.current?.release();
    };
  }, []);

  // Play on phase transition
  useEffect(() => {
    if (!enabled) return;
    if (phase === prevPhase.current) return;
    prevPhase.current = phase;

    if (phase === 'INHALE' && inhaleReady.current) {
      Vibration.vibrate(10); // Subtle tap
      inhaleSound.current?.stop(() => {
        inhaleSound.current?.setCurrentTime(0);
        inhaleSound.current?.play();
      });
    } else if (phase === 'EXHALE' && exhaleReady.current) {
      Vibration.vibrate(10); // Subtle tap
      exhaleSound.current?.stop(() => {
        exhaleSound.current?.setCurrentTime(0);
        exhaleSound.current?.play();
      });
    }
  }, [phase, enabled]);
};
