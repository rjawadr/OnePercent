# 🚀 OnePercent: The 1% Compounding Engine

**OnePercent** is a high-performance habit-tracking application built on the atomic philosophy of continuous, incremental improvement. It is designed to help you build an elite identity by focusing on getting **1% better every single day**.

---

## 💎 Core Philosophy: The 1% Rule
Most systems fail because they demand massive leaps. **OnePercent** leverages the mathematical power of compounding:
- **Consistency**: Doing a habit consistently for 365 days makes you **37x better** by the end of the year.
- **Identity-Based Tracking**: You don't just "run"; you build the identity of an "Endurance Athlete."
- **Zero Red Policy**: The UI avoids aggressive red colors to prevent the "what the hell" effect, opting for calm amber tones that encourage resets rather than quitting.

---

## 🛠️ How it Works: The Engine
The app's behavior is driven by a custom **Compounding Engine** (`src/engine/`):

### 1. Compounding Targets
When you complete a habit mission, the engine automatically calculates your next target:
- **Baseline x 1.01**: Success increases your difficulty by exactly 1%.
- **Frequency Control**: Choose between Daily, Weekly, or Monthly compounding to match your lifestyle.
- **Unit Precision**: The engine understands context (e.g., rounding kg to 0.5, minutes to 0.1, or reps to 1).

### 2. Regression & Resilience
Growth isn't always linear. The engine handles "off days" gracefully:
- **1 Day Miss**: No penalty. Your target stays the same. Consistency is about getting back on track.
- **2+ Day Miss**: The engine applies a small **5% regression** to help you rebuild momentum without burning out.
- **Rest Days**: Define your own "Rest Days" (e.g., weekends) where the engine pauses without penalizing your streak.

---

## 🌟 Key Features

### 📅 Mission Alignment (Today Screen)
- **Daily Mission Central**: A focused list of your "Core Disciplines" for the current day.
- **Progress Halo**: Visual progress tracking showing how close you are to your daily compound target.
- **Amber Alerts**: Dynamic banners that appear if you miss a day, providing motivational "Regain Focus" prompts.
- **Elite Status**: A high-end celebration state when all daily missions are "Secured."

### ⚙️ Habit Management
- **Identity-First Creation**: Multiple steps to define not just what you do, but *who you are becoming*.
- **Real-time Projections**: See exactly where you'll be in 3 months, 6 months, and 1 year before you even start.
- **Glassmorphic Toasts**: Premium, non-blocking confirmation modals for archiving and deleting habits, sitting clearly above the navigation layer.

### 📊 Deep Analytics (Stats & Detail)
- **Compound Charts**: SVG-based growth visualizations showing your trajectory.
- **Milestone Trophy System**: Special badges for 7, 30, 90, and 365-day streaks.
- **History Logs**: Every single "Secure Progress" action is logged with optional reflections.

### 🎨 Design System
- **Wellness Tones**: Soft mint greens, deep charcoals, and airy white spaces.
- **Haptic-Inspired Motion**: Spring-based animations and tactile interactions throughout.
- **Safe-Area Aware**: Optimized for modern device notches, gesture bars, and bottom navigation.

---

## 🏗️ Technical Stack
- **Framework**: React Native + Expo
- **State Management**: Zustand (with Persistence)
- **Styling**: Vanilla CSS-in-JS design system tokens (`src/theme/`)
- **Animations**: React Native Reanimated
- **Icons**: Material Community Icons
- **Date Handling**: date-fns

---

*"Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn't, pays it."*
**Track your 1% today.**
