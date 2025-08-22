const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Fix for Supabase ESM modules
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    },
    alias: {
      ...config.resolve.alias,
      '@supabase/supabase-js': path.resolve(__dirname, 'node_modules/@supabase/supabase-js'),
      '@supabase/postgrest-js': path.resolve(__dirname, 'node_modules/@supabase/postgrest-js'),
      '@supabase/storage-js': path.resolve(__dirname, 'node_modules/@supabase/storage-js'),
      '@supabase/realtime-js': path.resolve(__dirname, 'node_modules/@supabase/realtime-js'),
      '@supabase/functions-js': path.resolve(__dirname, 'node_modules/@supabase/functions-js'),
    },
  };

  // Handle .mjs files
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  });

  return config;
};
