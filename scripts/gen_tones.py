"""
Generate two minimal WAV tones for breath-in and breath-out cues.
Run: python scripts/gen_tones.py
Output: android/app/src/main/res/raw/breath_in.wav and breath_out.wav
"""
import struct, math, wave, os

RAW_DIR = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res', 'raw')
os.makedirs(RAW_DIR, exist_ok=True)

SAMPLE_RATE = 44100
DURATION    = 1.2   # seconds — short chime, not a long tone

def make_tone(path, freq_start, freq_end, amplitude=0.35):
    n_samples = int(SAMPLE_RATE * DURATION)
    frames = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # glide from freq_start to freq_end
        freq = freq_start + (freq_end - freq_start) * (t / DURATION)
        # fade in/out envelope so there are no clicks
        fade = min(t / 0.05, 1.0, (DURATION - t) / 0.1)
        sample = math.sin(2 * math.pi * freq * t) * amplitude * fade
        frames.append(struct.pack('<h', int(sample * 32767)))

    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(frames))
    print(f"Written: {path}")

# Inhale  → rising chime  (220 Hz → 440 Hz)
make_tone(os.path.join(RAW_DIR, 'breath_in.wav'),  220, 440)
# Exhale  → falling chime (440 Hz → 220 Hz)
make_tone(os.path.join(RAW_DIR, 'breath_out.wav'), 440, 220)

print("Done. Rebuild the app so Android picks up the new raw resources.")
