# Metro Bundler — Speed & Configuration

## Table of Contents
1. Persistent Cache
2. Module Resolution
3. Fast Refresh Troubleshooting
4. Monorepo Setup
5. Transformer Optimization
6. Symlink Support
7. Debugging Metro Performance

---

## 1. Persistent Cache

Metro's cache dramatically cuts cold-start times. Configure it explicitly:

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config') // or require('metro-config')
const os = require('os')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: path.join(os.tmpdir(), 'metro-cache'),
  }),
]

module.exports = config
```

**For CI** — persist the cache directory between runs:
```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: /tmp/metro-cache
    key: metro-${{ hashFiles('package-lock.json') }}
    restore-keys: metro-
```

**Clear cache when needed:**
```bash
npx expo start --clear
# or
npx react-native start --reset-cache
```

---

## 2. Module Resolution

### Reduce resolver extensions list
Metro tries each extension in order. Keep the list minimal:

```js
// metro.config.js
config.resolver.sourceExts = ['tsx', 'ts', 'jsx', 'js', 'json']
// Remove 'mjs', 'cjs', 'svg' etc. unless actually needed
```

### Block node_modules you don't use
```js
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/node_modules\/.*\/node_modules\/react-native\/.*/,
]
```

### Path aliases (works with `babel-plugin-module-resolver`)
```bash
npm install --save-dev babel-plugin-module-resolver
```
```js
// babel.config.js
module.exports = {
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@components': './src/components',
        '@screens':    './src/screens',
        '@stores':     './src/stores',
        '@utils':      './src/utils',
        '@hooks':      './src/hooks',
      },
    }],
  ],
}
```
```json
// tsconfig.json — must mirror babel aliases
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*":    ["src/screens/*"],
      "@stores/*":     ["src/stores/*"],
      "@utils/*":      ["src/utils/*"],
      "@hooks/*":      ["src/hooks/*"]
    }
  }
}
```

### Watch folder exclusions
Tell Metro to ignore directories that never contain app code:
```js
config.watchFolders = [
  // Add any extra folders Metro should watch (e.g. in monorepo)
]
// Exclude large directories from the watcher
config.resolver.blacklistRE = /android\/build\/.*/
```

---

## 3. Fast Refresh Troubleshooting

Fast Refresh breaks silently in these common cases:

| Symptom | Cause | Fix |
|---|---|---|
| Full reload instead of HMR | Component exported with `module.exports =` | Use ES `export default` |
| HMR works but state is lost | Component defined inside another function | Move to module top level |
| Fast Refresh disabled | Class component with lifecycle side effects | Wrap in functional component |
| Changes not reflected | Cached transform from old version | `npx expo start --clear` |
| Refresh loops infinitely | Side effect at module root runs on every update | Move into `useEffect` |

**Enable verbose Fast Refresh logging:**
```js
// index.js — temporary debug
if (__DEV__) {
  const { LogBox } = require('react-native')
  LogBox.ignoreLogs(['Fast refresh'])
}
```

**Rules that guarantee Fast Refresh works:**
1. Each file exports only one component
2. No side effects at module scope (use `useEffect`)
3. Use ES module syntax (`export`, `import`), not CommonJS
4. No `React.memo` wrapping an export that also has named exports from same file

---

## 4. Monorepo Setup

### Yarn Workspaces + Metro
```js
// metro.config.js — at app package root
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..') // adjust depth

const config = getDefaultConfig(projectRoot)

// 1. Watch all packages in the monorepo
config.watchFolders = [workspaceRoot]

// 2. Let Metro resolve from workspace root node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// 3. Force single React instance
config.resolver.extraNodeModules = {
  react:        path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
}

module.exports = config
```

### Turborepo caching for Metro
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".expo/**", "dist/**"]
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

---

## 5. Transformer Optimization

### Enable `inlineRequires` for large apps
Defers module evaluation until first `require()` call — can cut startup time 20–40%:
```js
// metro.config.js
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
}
```

**Warning:** `inlineRequires` can break circular dependencies. Test thoroughly.

### Use SWC transformer (faster than Babel for large codebases)
```bash
npm install --save-dev @nicolo-ribaudo/metro-swc-transformer
# Experimental — check compatibility with your RN version first
```

### Minimize Babel plugins in production
Each Babel plugin adds transform time. Audit `babel.config.js`:
```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Only add what you actually use
    // 'react-native-reanimated/plugin', // MUST be last if included
  ],
  // Env-specific plugins
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
}
```

---

## 6. Symlink Support

Required for monorepos using npm/yarn symlinks:
```js
// metro.config.js
config.resolver.unstable_enableSymlinks = true
// RN 0.73+ / Expo SDK 50+
```

---

## 7. Debugging Metro Performance

```bash
# Show what Metro is doing
METRO_BUNDLER_DEBUG=1 npx expo start

# Time cold start
time npx expo start --non-interactive

# Verbose bundle output
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/out.js \
  --verbose

# Find what's being bundled
npx react-native-bundle-visualizer
```

**Key metrics to track:**
- Cold start (no cache): target < 15s for medium apps
- Warm start (with cache): target < 3s
- Fast Refresh round-trip: target < 500ms
