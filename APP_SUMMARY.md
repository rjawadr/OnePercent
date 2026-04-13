# OnePercent: System Overview & Capability Document

This document provides a comprehensive overview of the **OnePercent** application, detailing its features, architectural components, and core functionalities. This serves as a reference for AI assistants to understand exactly what the app can do and how it is structured.

---

## 🚀 Core Philosophy
OnePercent is a "Pro Max" premium wellness application designed to help users build 1% better versions of themselves every day. It combines **Behavioral Activation (Habits)** with **Cognitive Behavioral Therapy (CBT)** and **Exposure Therapy** specifically tailored for Agoraphobia and general anxiety.

---

## 🛠️ Feature List

### 1. Agoraphobia & Anxiety Management
*   **Fear Profile Onboarding**: Users build a personalized anxiety profile identifying specific triggers (e.g., driving, crowds, wide-open spaces).
*   **Exposure Therapy (Laddering)**: A structured approach to desensitization. Users create "Steps" for their exposure ladder with associated SUDS (Distress) ratings.
*   **Active Exposure Sessions**: A dedicated mode for real-time therapy.
    *   **SUDS Monitoring**: Real-time tracking of anxiety levels during exposure.
    *   **Session Timer**: Tracking duration to ensure habituation occurs.
    *   **Physical Feedback**: Logging physical symptoms during sessions.
*   **Crisis/Panic Support**: Immediate access to grounding and breathing tools via a high-visibility support button.

### 2. Cognitive Behavioral Therapy (CBT) Tools
*   **Thought Journal**: A repository for mental health logging.
*   **CBT Thought Records**: A specialized 7-step process (Situation → Feelings → Thoughts → Evidence For/Against → Balanced Perspective → Outcome) to challenge cognitive distortions.
*   **AI Insights**: Integrated AI analysis (powered by Deepseek/OpenRouter) that reviews thought records and provides cognitive reframing suggestions.

### 3. Habit & Momentum Tracking
*   **Daily Habit Logging**: A sleek "Today" dashboard to track recurring habits.
*   **Detailed Goal Management**: Custom goal setup with frequency, intensity targets, and motivational milestones.
*   **Momentum System**: Tracking streaks and overall "OnePercent" progress.
*   **Habit Stats & Analytics**: Calendar views, progress charts, and performance projections.

### 4. Wellness Techniques
*   **Guided Breathing**: An interactive breathing module with Lottie-animated visual cues and synchronized audio or haptic feedback for inhalation/exhalation.
*   **Grounding Techniques**: Sensory-based "Reset" exercises for immediate calming.

---

## 🏗️ Core Components List

### 🛡️ Agoraphobia & Therapy Components
| Component | Description |
| :--- | :--- |
| **ExposureStepCard** | Displays a single step in the anxiety hierarchy with its difficulty and mastery status. |
| **SUDSSlider** | A custom interactive scale for users to rate their distress level from 0-100. |
| **AIInsightCard** | A premium glassmorphism card that displays AI-generated reframing suggestions for thought records. |
| **BreathingCircle** | A Lottie-powered expressive visual that guides users through rhythmic breathing. |
| **CrisisButton** | A persistent emergency UI element that triggers calming workflows. |
| **ProgressLadder** | A vertical visualization of the user's exposure journey and mastery levels. |
| **ThoughtRecordCard** | A list component summarizing previous CBT entries with emotional sentiment indicators. |

### 📈 Habit & Tracking Components
| Component | Description |
| :--- | :--- |
| **HabitCard** | The primary dashboard item showing today's habit status, streaks, and quick-logging actions. |
| **HabitLoggingModal** | A high-fidelity, gesture-driven bottom sheet for detailed daily completion logging. |
| **CreateHabitModal** | A multi-step workflow for configuring new habits with icons and frequency logic. |
| **DateScrollRow** | An interactive horizontal week/date picker for navigating historic data. |
| **HabitCalendar** | A monthly heat-map visualizing consistency. |
| **MilestoneCelebrationOverlay** | A full-screen confetti-based animation for when a user hits a momentum goal. |

### 💎 UI & Foundation Components
| Component | Description |
| :--- | :--- |
| **TodayHeader** | A dynamic header that displays the user's current "Momentum" and daily progress. |
| **CustomTabBar** | A floating, translucent bottom navigation bar with a "Pro Max" aesthetic. |
| **AmberBanner** | A system for displaying urgent notifications or important reminders. |
| **Confetti** | A specialized animation layer for rewarding user achievements. |

---

## 🧪 Tech Stack & Architecture
*   **Frontend**: React Native with TypeScript.
*   **Persistence**: `react-native-nitro-sqlite` for high-performance local data storage.
*   **Animations**: `lottie-react-native` and `react-native-reanimated`.
*   **Design System**: Custom "Pro Max" Vanilla CSS-in-JS focusing on glassmorphism, depth, and sleek transitions.
*   **AI Integration**: OpenRouter API for context-aware CBT insights.

---

*This document is auto-generated to keep future AI interactions synchronized with the app's capabilities.*
