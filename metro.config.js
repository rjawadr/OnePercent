const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const os = require('os');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  cacheStores: [
    new (require('metro-cache').FileStore)({
      root: path.join(os.tmpdir(), 'metro-cache'),
    }),
  ],
  resolver: {
    sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
    blockList: [
      /.*\/__tests__\/.*/,
      /.*\/node_modules\/.*\/node_modules\/react-native\/.*/,
      /android\/build\/.*/,
    ],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
