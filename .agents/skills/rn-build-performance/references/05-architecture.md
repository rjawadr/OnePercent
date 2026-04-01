# Architecture Patterns That Affect Build Speed

## Table of Contents
1. Barrel Files — The Silent Build Killer
2. Import Discipline
3. Lazy Loading Screens
4. Code Splitting Strategy
5. Circular Dependencies
6. Dependency Audit
7. Project Structure That Scales

---

## 1. Barrel Files — The Silent Build Killer

A barrel file re-exports many modules from a single `index.ts`. They're convenient
but force Metro to resolve *all* exports whenever *any* one is imported.

### The problem
```ts
// src/components/index.ts  ← barrel file
export { Button } from './Button'
export { Card } from './Card'
export { Modal } from './Modal'
export { Input } from './Input'
// ... 40 more exports

// SomeScreen.tsx imports ONE component
import { Button } from '@components'
// → Metro must evaluate ALL 40+ files on startup
```

### The fix — import directly
```ts
// FAST — Metro resolves only Button.tsx
import { Button } from '@components/Button'

// FAST — direct path
import { Button } from '../components/Button'

// SLOW — forces Metro to touch all barrel exports
import { Button } from '@components'
```

### When barrel files are OK
- In shared package libraries where tree-shaking is guaranteed by the bundler
- In `types/index.ts` — types are erased at compile time, no runtime cost
- When the barrel has ≤ 5 exports from the same domain

### Lint rule to enforce direct imports
```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["@components", "@screens", "@hooks", "@stores", "@utils"],
        "message": "Import directly from the module file, not the barrel index."
      }]
    }]
  }
}
```

---

## 2. Import Discipline

### Named imports from large libraries
```ts
// SLOW — imports entire lodash (600KB+)
import _ from 'lodash'
const result = _.debounce(fn, 300)

// FAST — imports only debounce (~2KB)
import debounce from 'lodash/debounce'

// ALSO FAST — using a modern alternative
import { debounce } from 'es-toolkit'  // tree-shakeable, typed
```

### Date library best practices
```ts
// AVOID — moment.js is 300KB+ and not tree-shakeable
import moment from 'moment'

// USE — date-fns (tree-shakeable per function)
import { format, parseISO, differenceInDays } from 'date-fns'

// OR — dayjs with plugins (2KB core)
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
```

### Icon libraries
```ts
// SLOW — loads ALL icons
import { AntDesign } from '@expo/vector-icons'

// FAST — load only the pack you use
import AntDesign from '@expo/vector-icons/AntDesign'
```

---

## 3. Lazy Loading Screens

Don't load all screen code at startup. Lazy load with `React.lazy` or navigation-level lazy loading:

### React Navigation lazy tabs
```tsx
// Tabs don't mount until first visit
<Tab.Navigator screenOptions={{ lazy: true }}>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
  <Tab.Screen name="Settings" component={SettingsScreen} />
</Tab.Navigator>
```

### Dynamic import for heavy screens
```tsx
import React, { Suspense, lazy } from 'react'
import { ActivityIndicator } from 'react-native'

// Heavy screen only loaded when navigated to
const HeavyAnalyticsScreen = lazy(() => import('./screens/HeavyAnalyticsScreen'))

const AnalyticsWrapper = () => (
  <Suspense fallback={<ActivityIndicator />}>
    <HeavyAnalyticsScreen />
  </Suspense>
)
```

### Defer heavy module initialization
```ts
// WRONG — runs on import, blocks startup
import { initHeavySDK } from 'heavy-sdk'
initHeavySDK()  // called at module evaluation

// RIGHT — defer until needed
let sdkInitialized = false

export const getHeavySDK = async () => {
  if (!sdkInitialized) {
    const { initHeavySDK } = await import('heavy-sdk')
    await initHeavySDK()
    sdkInitialized = true
  }
}
```

---

## 4. Code Splitting Strategy

### Feature-based directory structure
Keep each feature self-contained. Metro only traverses the graph from the entry point:

```
src/
  features/
    auth/
      screens/
        LoginScreen.tsx
        SignupScreen.tsx
      hooks/
        useAuth.ts
      store/
        authStore.ts
      api/
        authApi.ts
      index.ts      ← only exports what other features need
    habits/
      screens/
      hooks/
      store/
      index.ts
    onboarding/
      screens/
      index.ts
  shared/
    components/     ← NEVER import features from here, only primitives
    hooks/
    utils/
    types/
```

**Rule:** Features can import from `shared/`. Features CANNOT import from other features.
Cross-feature communication goes through stores or navigation params.

### Heavy dependencies — lazy initialize
```ts
// stores/analyticsStore.ts
let posthogInstance: PostHog | null = null

export const getAnalytics = async () => {
  if (!posthogInstance) {
    const { PostHog } = await import('posthog-react-native')
    posthogInstance = new PostHog(POSTHOG_KEY)
  }
  return posthogInstance
}
```

---

## 5. Circular Dependencies

Circular imports cause Metro to emit warnings and can cause subtle bugs and slower resolution.

### Detect circular dependencies
```bash
npm install --save-dev madge

# Find circular deps
npx madge --circular --extensions ts,tsx src/

# Generate dependency graph image
npx madge --image graph.svg --extensions ts,tsx src/
```

### Common circular patterns and fixes

**Pattern: Store imports component, component imports store**
```ts
// BAD — circular
// userStore.ts
import { Avatar } from '@components/Avatar'  // ← wrong, stores don't render

// GOOD — stores never import components
// userStore.ts has no UI imports
// Avatar.tsx imports from userStore if needed
```

**Pattern: Utils importing from features**
```ts
// BAD
// src/utils/formatting.ts
import { UserProfile } from '@features/auth'  // ← circular risk

// GOOD — utils only import from types
import type { UserProfile } from '@types/user'
```

**Dependency direction rule:**
```
components → (nothing above this layer)
screens    → components, stores, hooks
stores     → api, utils, types
api        → utils, types
utils      → types
types      → (nothing)
```

---

## 6. Dependency Audit

### Find large dependencies
```bash
# Analyze what's in your bundle
npx react-native-bundle-visualizer

# Check installed package sizes
npx cost-of-modules --no-dev
```

### Replace heavy packages

| Heavy package | Lighter alternative | Size saving |
|---|---|---|
| `moment` | `date-fns` or `dayjs` | ~280KB |
| `lodash` | `es-toolkit` or per-function imports | ~500KB |
| `axios` | `ky` or native `fetch` | ~40KB |
| `react-native-maps` (if unused) | Remove | ~8MB native |
| `@react-native-community/netinfo` | Remove if not needed offline | ~2MB native |

### Detect duplicate packages
```bash
# Yarn
yarn why react-native
# Shows why each version is installed

# Check for duplicate React versions (breaks hooks)
find node_modules -name "react" -type d -maxdepth 4
```

---

## 7. Project Structure That Scales

### Recommended structure for 1% Discipline-scale apps
```
src/
  app/           ← app.tsx entry, providers, navigation root
  features/
    auth/
    habits/       ← habit tracking feature
    anxiety/      ← CBT / agoraphobia module
    coaching/     ← Claude API coaching
    onboarding/
    settings/
  shared/
    components/   ← design system primitives
    hooks/        ← cross-feature hooks
    utils/        ← pure functions
    types/        ← shared TypeScript types
    constants/    ← app-wide constants
  services/
    api/          ← external API clients
    storage/      ← WatermelonDB repositories
    analytics/    ← PostHog wrappers
```

### Module boundary lint enforcement
```json
// .eslintrc.json — enforce import direction
{
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        {
          "target": "./src/shared",
          "from": "./src/features",
          "message": "shared/ must not import from features/"
        },
        {
          "target": "./src/services",
          "from": "./src/features",
          "message": "services/ must not import from features/"
        }
      ]
    }]
  }
}
```
