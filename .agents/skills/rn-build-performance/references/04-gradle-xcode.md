# Gradle & Xcode — Native Build Speed

## Table of Contents
1. Gradle Optimization
2. Xcode Optimization
3. Shared Build Cache (Gradle Enterprise)
4. Parallel Compilation
5. Dependency Version Pinning
6. Profiling Native Builds

---

## 1. Gradle Optimization

### `gradle.properties` — single biggest win file
```properties
# android/gradle.properties

# JVM heap — increase if you have RAM (default 512m is too low)
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# Parallel project execution
org.gradle.parallel=true

# Gradle daemon — reuse process between builds (massive win for local dev)
org.gradle.daemon=true

# Configuration cache (Gradle 7.4+) — cache the configuration phase
org.gradle.configuration-cache=true

# Build cache — reuse outputs from previous builds
org.gradle.caching=true

# Show reasons for configuration cache misses
# org.gradle.configuration-cache.problems=warn

# React Native specific
android.useAndroidX=true
android.enableJetifier=true

# Disable unused build features
android.defaults.buildfeatures.buildconfig=false
android.defaults.buildfeatures.aidl=false
android.defaults.buildfeatures.renderscript=false
android.defaults.buildfeatures.resvalues=false
android.defaults.buildfeatures.shaders=false
```

### `android/app/build.gradle` optimizations
```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 24      // Higher minSdk = fewer compatibility shims
        targetSdkVersion 34
    }

    buildTypes {
        debug {
            // Skip ProGuard in debug builds
            minifyEnabled false
            shrinkResources false
        }
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),
                          'proguard-rules.pro'
        }
    }

    // Split APKs by ABI — reduces test APK size by 60%
    splits {
        abi {
            enable true
            reset()
            include 'arm64-v8a', 'armeabi-v7a'
            universalApk false  // true for Play Store submission
        }
    }
}
```

### Local build cache directory
```bash
# ~/.gradle/gradle.properties  (global)
org.gradle.caching=true
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.jvmargs=-Xmx4096m
```

### Warming the cache
```bash
cd android
./gradlew assembleDebug   # first run — populates cache
./gradlew assembleDebug   # second run — should be 50–70% faster
```

---

## 2. Xcode Optimization

### `Podfile` — speed settings
```ruby
# ios/Podfile
platform :ios, '13.0'

# Use static frameworks — reduces linking time
use_frameworks! :linkage => :static

target 'YourApp' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,      # Hermes = faster JS startup
    :fabric_enabled => false,     # Enable only if using New Architecture
  )
end

# Speed up pod install
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Reduce simulator arch build time
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      # Faster indexing
      config.build_settings['COMPILER_INDEX_STORE_ENABLE'] = 'NO'
    end
  end
end
```

### Xcode build settings (via `project.pbxproj` or Xcode UI)

**Debug build only — do NOT apply to Release:**
```
ONLY_ACTIVE_ARCH = YES                // build only for current device arch
SWIFT_COMPILATION_MODE = incremental  // incremental Swift compilation
DEBUG_INFORMATION_FORMAT = dwarf      // faster than dwarf-with-dsym
ENABLE_TESTABILITY = YES             // needed for tests
MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE
```

**Release build:**
```
SWIFT_OPTIMIZATION_LEVEL = -O        // full optimization
DEBUG_INFORMATION_FORMAT = dwarf-with-dsym
ENABLE_BITCODE = NO                  // Bitcode deprecated, slows builds
```

### DerivedData cache
Xcode's DerivedData is equivalent to Gradle's build cache. Don't clean it unless necessary:
```bash
# ONLY clean when builds are corrupted, not routinely
rm -rf ~/Library/Developer/Xcode/DerivedData

# Find large DerivedData entries
du -sh ~/Library/Developer/Xcode/DerivedData/*
```

### Speed up `pod install`
```bash
# Use CDN instead of GitHub master (much faster)
# Top of Podfile:
source 'https://cdn.cocoapods.org/'

# Parallel pod downloads (CocoaPods 1.10+)
# Already default — verify: pod install --verbose

# Cache pods between CI runs
# Cache: ~/.cocoapods/repos and ios/Pods
```

---

## 3. Shared Build Cache (Gradle)

For teams, a shared remote Gradle build cache can let one developer's build artifacts
be reused by another:

```kotlin
// settings.gradle.kts
buildCache {
  remote<HttpBuildCache> {
    url = uri("https://your-build-cache-server/cache/")
    isPush = System.getenv("CI") != null  // only push from CI
    credentials {
      username = System.getenv("GRADLE_CACHE_USER")
      password = System.getenv("GRADLE_CACHE_PASS")
    }
  }
}
```

**Free option — GitHub Actions cache as Gradle cache:**
```yaml
- uses: gradle/gradle-build-action@v2
  with:
    gradle-home-cache-includes: |
      caches
      notifications
```

---

## 4. Parallel Compilation

### Android — parallel Dex compilation
```gradle
// android/app/build.gradle
android {
    dexOptions {
        preDexLibraries true         // pre-dex libs, reuse on incremental builds
        maxProcessCount 4            // parallel dex workers
        javaMaxHeapSize "4g"
    }
}
```

### Xcode — parallel targets
In Xcode: Product → Scheme → Edit Scheme → Build → check "Parallelize Build"

Or via `xcodebuild`:
```bash
xcodebuild -parallelizeTargets \
  -jobs $(sysctl -n hw.logicalcpu) \
  -scheme YourApp \
  -configuration Debug
```

---

## 5. Dependency Version Pinning

Unpinned native dependencies force resolution on every build:

```gradle
// android/app/build.gradle — pin exact versions
dependencies {
    implementation "com.facebook.react:react-android:0.73.6"
    implementation "com.facebook.react:hermes-android:0.73.6"
    // Avoid: implementation "com.some:lib:+" (dynamic version = slow)
}
```

```ruby
# ios/Podfile.lock — commit this file
# Committing Podfile.lock guarantees reproducible pod install times
# pod install reads from lock file (~5s) vs resolving (~30-60s)
```

---

## 6. Profiling Native Builds

### Gradle build scan
```bash
cd android
./gradlew assembleDebug --scan
# Outputs URL to detailed build timeline
```

### Gradle `--profile` (local HTML report)
```bash
./gradlew assembleDebug --profile
# Report: android/build/reports/profile/
```

### Xcode build timing summary
In Xcode: Product → Build With Timing Summary
Or via `xcodebuild`:
```bash
xcodebuild -scheme YourApp -configuration Debug \
  build | xcpretty --report time
```

**Key Gradle metrics to watch:**
```
> Task :app:compileDebugJavaWithJavac      12s  ← slow = too many Java files
> Task :app:dexBuilderDebug                 8s  ← slow = too many classes
> Task :app:mergeDebugResources             5s  ← slow = too many res files
> Task :app:processDebugResources           3s
Total build time: 35s                           ← target < 20s with warm cache
```

**Target build times (Android, warm Gradle cache):**
| Change type | Expected time |
|---|---|
| JS-only change (no native rebuild) | 3–8s (Metro only) |
| Java/Kotlin change | 15–25s |
| Full clean build | 60–120s |
| After `./gradlew clean` | 90–150s |
