const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for Supabase ESM modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver for problematic packages
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Handle ESM modules
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx',
];

// Add node_modules resolution
config.resolver.nodeModulesPaths = [
  require('path').resolve(__dirname, 'node_modules'),
];

// Fix for @supabase packages
config.resolver.alias = {
  '@supabase/supabase-js': require.resolve('@supabase/supabase-js'),
  '@supabase/postgrest-js': require.resolve('@supabase/postgrest-js'),
  '@supabase/storage-js': require.resolve('@supabase/storage-js'),
  '@supabase/realtime-js': require.resolve('@supabase/realtime-js'),
  '@supabase/functions-js': require.resolve('@supabase/functions-js'),
};

// Add resolver for problematic ESM modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main', 'module'];

// Handle .mjs files
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'mjs',
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx',
];

module.exports = config;
