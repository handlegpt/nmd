const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for React Native Web
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

// Add platform extensions
config.resolver.platforms = ['web', 'ios', 'android'];

// Add source extensions
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// Add node modules resolution
config.resolver.nodeModulesPaths = [
  'node_modules',
];

// Add fallback for Node.js modules
config.resolver.fallback = {
  ...config.resolver.fallback,
  "crypto": require.resolve("crypto-browserify"),
  "stream": require.resolve("stream-browserify"),
  "buffer": require.resolve("buffer"),
};

module.exports = config;
