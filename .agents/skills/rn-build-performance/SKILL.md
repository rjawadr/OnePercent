---
name: rn-build-performance
description: >
  React Native build speed and developer experience optimization. Use this skill
  for ANY task involving slow builds, Metro bundler configuration, Expo EAS build
  optimization, TypeScript compilation speed, hot reload / fast refresh issues,
  Gradle/Xcode build times, monorepo setup, CI/CD pipeline speed, or code
  architecture patterns that prevent slow incremental builds. Trigger for phrases
  like "build is slow", "Metro is taking forever", "hot reload broken", "reduce
  CI time", "TypeScript is slow", "Gradle build hangs", "Expo build takes too long",
  "optimize metro config", "module resolution slow", "monorepo RN setup", or
  any question about making the React Native development loop faster.
  Always use this skill alongside react-native-production when the user is working
  on their app's build toolchain, developer workflow, or CI pipeline.
---

# React Native Build Performance Skill

## How to Use This Skill

Organized into 5 reference files. Read the one(s) matching the user's problem.

```
references/
  01-metro.md           → Metro bundler config, caching, module resolution
  02-typescript.md      → tsc speed, path aliases, project references, incremental builds
  03-expo-eas.md        → EAS Build profiles, caching, fingerprinting, local builds
  04-gradle-xcode.md    → Native build speed, Gradle daemons, Xcode settings
  05-architecture.md    → Code patterns that affect build speed (barrel files, imports, lazy loading)
```

## Quick Domain Selector

| Problem | Read |
|---|---|
| `metro bundler` slow to start | 01-metro.md |
| Hot reload / Fast Refresh not working | 01-metro.md |
| Module resolution errors or slowness | 01-metro.md |
| `tsc --noEmit` slow | 02-typescript.md |
| TypeScript path aliases not resolving | 02-typescript.md |
| EAS Build taking 15+ minutes | 03-expo-eas.md |
| EAS cache not being used | 03-expo-eas.md |
| Gradle build slow or hanging | 04-gradle-xcode.md |
| Xcode build takes forever | 04-gradle-xcode.md |
| Monorepo build issues | 01-metro.md + 02-typescript.md |
| Barrel files (`index.ts`) causing slowness | 05-architecture.md |
| Circular dependency warnings | 05-architecture.md |
| CI pipeline slow | 03-expo-eas.md + 04-gradle-xcode.md |
| Import cost / bundle bloat from deps | 05-architecture.md + 01-metro.md |

## Core Principles (apply to all domains)

1. **Cache everything** — Metro, Gradle, EAS, and tsc all support caching; none are enabled by default in all environments
2. **Measure before tuning** — `METRO_BUNDLER_DEBUG=1`, `--verbose`, Gradle `--profile` tell you *where* time goes
3. **Avoid barrel file re-exports** — `index.ts` that re-exports 50 modules forces Metro to resolve all 50 on startup
4. **Parallelize native builds** — Gradle and Xcode both support parallel compilation; enable it explicitly
5. **Separate dev and CI configs** — what makes local DX fast (e.g. no type checking) differs from what makes CI correct
6. **Incremental > full** — design tsconfig, Metro, and Gradle to do as little re-work as possible on each change
