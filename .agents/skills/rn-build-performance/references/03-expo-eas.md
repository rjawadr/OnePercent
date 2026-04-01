# Expo EAS Build — Speed Optimization

## Table of Contents
1. Build Profile Strategy
2. Cache Configuration
3. Fingerprinting & Cache Invalidation
4. Local Builds
5. Custom Build Hooks
6. CI Integration
7. Measuring EAS Build Time

---

## 1. Build Profile Strategy

```json
// eas.json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": true },
      "cache": { "key": "dev-v1" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "preview",
      "cache": { "key": "preview-v1" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "channel": "production",
      "cache": { "key": "prod-v1" }
    }
  },
  "submit": {
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json" },
      "ios": { "appleId": "you@example.com", "ascAppId": "1234567890" }
    }
  }
}
```

**Profile design principles:**
- `development` — fast, APK not AAB, skip signing overhead
- `preview` — same as production config but internal distribution (catches signing issues early)
- `production` — AAB + full optimization, only runs from `main` branch

---

## 2. Cache Configuration

### What EAS caches (when configured correctly)
- `node_modules` — keyed on `package-lock.json` / `yarn.lock`
- Gradle build cache — keyed on native code changes
- CocoaPods — keyed on `Podfile.lock`
- Custom directories you specify

### Explicit cache setup in `eas.json`
```json
{
  "build": {
    "production": {
      "cache": {
        "key": "prod-v2",
        "customPaths": [
          "node_modules/.cache",
          ".expo"
        ],
        "disabled": false
      }
    }
  }
}
```

### Bust cache correctly
Change `"key": "prod-v2"` → `"prod-v3"` when:
- You add/remove a native module
- You upgrade React Native or Expo SDK
- A build is producing corrupt artifacts
- You change native config files (`app.json`, `eas.json`)

**Do NOT change the key for:**
- JS-only changes
- Dependency version bumps with no native changes
- Screen or component additions

---

## 3. Fingerprinting & Cache Invalidation

Expo's fingerprint tool determines whether a new native build is needed:

```bash
npm install --save-dev @expo/fingerprint

# Check if native layer changed since last build
npx @expo/fingerprint .

# Compare two commits
npx @expo/fingerprint . --diff HEAD~1
```

### Use fingerprint in CI to skip native builds
```yaml
# .github/workflows/build.yml
- name: Check if native build needed
  id: fingerprint
  run: |
    FINGERPRINT=$(npx @expo/fingerprint . --json | jq -r '.hash')
    echo "hash=$FINGERPRINT" >> $GITHUB_OUTPUT

- name: Build native (only if fingerprint changed)
  if: steps.fingerprint.outputs.hash != vars.LAST_NATIVE_HASH
  run: eas build --platform android --profile preview --non-interactive
```

### What's included in the fingerprint
- `app.json` / `app.config.js`
- `package.json` (native deps only)
- `android/` and `ios/` directories
- Expo config plugins

---

## 4. Local Builds

Local builds skip the EAS servers entirely — fastest option for iteration:

```bash
# Install local build dependencies
npm install --save-dev @expo/local-build-plugin

# Android local build
eas build --platform android --profile development --local

# iOS local build (requires Xcode)
eas build --platform ios --profile development --local
```

### When to use local builds
- Iterating on native modules
- Debugging build failures (full logs, no server timeout)
- Teams with fast machines and slow internet
- Testing custom build hooks

### Local build output
```bash
# APK is saved to ./builds/
ls ./builds/
# build-1710000000000.apk
```

---

## 5. Custom Build Hooks

Run scripts at specific points in the EAS build pipeline:

```bash
# eas-build-pre-install.sh — runs before npm install
#!/bin/bash
echo "Pre-install: setting up environment"
export NODE_OPTIONS="--max-old-space-size=4096"

# eas-build-post-install.sh — runs after npm install, before build
#!/bin/bash
echo "Post-install: patching native modules"
npx patch-package
```

```json
// package.json
{
  "scripts": {
    "eas-build-pre-install":  "bash ./scripts/eas-build-pre-install.sh",
    "eas-build-post-install": "bash ./scripts/eas-build-post-install.sh",
    "eas-build-on-success":   "bash ./scripts/notify-success.sh",
    "eas-build-on-error":     "bash ./scripts/notify-error.sh"
  }
}
```

### Speed up installs in hooks
```bash
# eas-build-post-install.sh
# Remove unnecessary packages in CI
if [ "$EAS_BUILD_PROFILE" = "production" ]; then
  npm prune --production
fi
```

---

## 6. CI Integration

### GitHub Actions — EAS build with caching
```yaml
name: EAS Build
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Cache Expo
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .expo
            node_modules/.cache
          key: expo-${{ hashFiles('package-lock.json', 'eas.json') }}
          restore-keys: expo-

      - run: npm ci

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Preview APK
        run: eas build --platform android --profile preview --non-interactive --no-wait

      - name: Wait for build
        run: eas build:view --json | jq '.status'
```

### Run JS validation before triggering EAS (save money + time)
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test -- --passWithNoTests

  build:
    needs: validate   # only runs if validate passes
    runs-on: ubuntu-latest
    steps:
      - run: eas build --platform android --profile preview --non-interactive
```

---

## 7. Measuring EAS Build Time

```bash
# List recent builds with timing
eas build:list --limit 10 --json | \
  jq '.[] | {status, platform, duration: (.completedAt - .queuedAt)}'

# View build logs in real time
eas build --platform android --profile preview

# View logs of a specific build
eas build:view <build-id>
```

**Target build times (EAS remote):**
| Profile | Android | iOS |
|---|---|---|
| development (APK, cached) | 4–6 min | 6–8 min |
| preview (APK, cached) | 5–8 min | 7–10 min |
| production (AAB, cached) | 6–10 min | 10–15 min |
| Any (cache miss) | 12–20 min | 18–30 min |

**Cache miss diagnosis:**
```bash
# Check if cache was used in last build
eas build:view <build-id> --json | jq '.metadata.cacheKey'
# If null — cache was not used
```
