# TypeScript — Compilation Speed

## Table of Contents
1. tsconfig Tuning
2. Project References (Monorepos)
3. Incremental Compilation
4. Type Checking in CI vs Dev
5. Path Aliases That Don't Slow Metro
6. Common Slowness Culprits
7. Measuring tsc Performance

---

## 1. tsconfig Tuning

### Minimal fast tsconfig template
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "jsx": "react-native",
    "module": "ESNext",
    "moduleResolution": "bundler",   // faster than "node" for RN
    "strict": true,
    "noEmit": true,                  // never emit — Metro handles transpilation
    "skipLibCheck": true,            // HUGE speed win — skip node_modules .d.ts
    "isolatedModules": true,         // enables single-file transpilation (Babel/SWC compat)
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*":    ["src/screens/*"],
      "@stores/*":     ["src/stores/*"],
      "@utils/*":      ["src/utils/*"],
      "@hooks/*":      ["src/hooks/*"],
      "@types/*":      ["src/types/*"]
    }
  },
  "include": ["src", "app", "index.ts"],
  "exclude": [
    "node_modules",
    "android",
    "ios",
    ".expo",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

**Key performance flags:**
- `skipLibCheck: true` — typically saves 30–60% of check time
- `noEmit: true` — don't generate JS (Metro does this)
- `isolatedModules: true` — allows per-file type stripping, enables faster tools
- `moduleResolution: "bundler"` — matches how Metro resolves, avoids false errors

### Separate tsconfig for tests
```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "@testing-library/react-native"]
  },
  "include": ["src", "**/*.test.ts", "**/*.spec.ts", "jest.setup.ts"]
}
```

---

## 2. Project References (Monorepos)

For monorepos with shared packages, project references let tsc build only what changed:

```
apps/
  mobile/
    tsconfig.json
packages/
  ui/
    tsconfig.json
  utils/
    tsconfig.json
  types/
    tsconfig.json
```

```json
// packages/ui/tsconfig.json
{
  "compilerOptions": {
    "composite": true,        // required for project references
    "declaration": true,      // emit .d.ts for consumers
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

```json
// apps/mobile/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "references": [
    { "path": "../../packages/ui" },
    { "path": "../../packages/utils" },
    { "path": "../../packages/types" }
  ]
}
```

**Build shared packages:**
```bash
# From monorepo root
npx tsc --build packages/ui packages/utils packages/types

# Watch mode — rebuilds only changed packages
npx tsc --build --watch
```

---

## 3. Incremental Compilation

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"  // cache file
  }
}
```

```bash
# First run — slow (builds cache)
npx tsc --noEmit        # e.g. 12s

# Subsequent runs — fast (uses .tsbuildinfo)
npx tsc --noEmit        # e.g. 1.5s
```

**Cache `.tsbuildinfo` in CI:**
```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: .tsbuildinfo
    key: tsc-${{ hashFiles('src/**/*.ts', 'tsconfig.json') }}
    restore-keys: tsc-
```

**Add to `.gitignore`:**
```
.tsbuildinfo
```

---

## 4. Type Checking in CI vs Dev

### Dev workflow — type check in background
Don't block the terminal with `tsc`. Use VS Code's built-in checker + run type check asynchronously:

```json
// package.json
{
  "scripts": {
    "type-check":       "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch --preserveWatchOutput",
    "lint":             "eslint src --ext .ts,.tsx --max-warnings 0",
    "validate":         "npm run type-check && npm run lint"
  }
}
```

### CI — run type check in parallel with tests
```yaml
# .github/workflows/ci.yml
jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - uses: actions/cache@v4
        with:
          path: .tsbuildinfo
          key: tsc-${{ hashFiles('src/**/*.ts') }}
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    # runs in parallel — don't wait for type-check
```

### Never run `tsc` during Metro bundling
Metro uses Babel (not tsc) to transpile. `tsc` is only for type validation. Keep them separate.

---

## 5. Path Aliases That Don't Slow Metro

The three-part alias setup (tsconfig + babel + metro) must stay in sync:

```
tsconfig.json  →  type checking resolution
babel.config.js →  runtime transpilation (Babel transforms @foo/bar → ../../)
metro.config.js →  (optional) if tsconfig aliases aren't being resolved
```

**Quick check — if aliases work in TypeScript but not at runtime:**
```bash
# Verify babel-plugin-module-resolver is installed
npm ls babel-plugin-module-resolver

# Check babel output
npx babel src/screens/HomeScreen.tsx --out-file /tmp/out.js
# Look for the alias replaced with a relative path
```

---

## 6. Common Slowness Culprits

| Cause | Impact | Fix |
|---|---|---|
| `skipLibCheck: false` | +30–60% slower | Set `skipLibCheck: true` |
| Huge `include` glob | Checks all files always | Narrow `include` to source dirs only |
| `strict: false` + explicit strict flags | Redundant work | Just use `"strict": true` |
| `any` suppressions with `as any` everywhere | Hides real errors, no real speed gain | Fix the types |
| Importing whole libraries | `import _ from 'lodash'` checks all of lodash | `import debounce from 'lodash/debounce'` |
| Generated code in `src/` | tsc checks generated files | Move to `src/generated/` and exclude |
| No `.tsbuildinfo` | Rebuilds from scratch every time | Enable `incremental: true` |

---

## 7. Measuring tsc Performance

```bash
# Built-in diagnostics — shows time per file
npx tsc --noEmit --diagnostics

# Detailed trace (outputs JSON, open in Chromium)
npx tsc --noEmit --generateTrace /tmp/tsc-trace
# Open chrome://tracing → Load → select /tmp/tsc-trace/trace.json

# Find the slowest type checks
npx tsc --noEmit --extendedDiagnostics 2>&1 | tail -30
```

**Key metrics from `--extendedDiagnostics`:**
```
Files:              142
Lines of Library:   38,230
Lines of Source:    12,847     ← your code
Check time:         4.2s       ← target < 10s for medium apps
Total time:         5.1s
```

If `Lines of Library` >> `Lines of Source`, `skipLibCheck: true` will help most.
