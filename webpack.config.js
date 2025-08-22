const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // 优化开发模式性能
  devServer: {
    hot: true,
    compress: true,
    client: {
      overlay: false, // 减少错误覆盖层
    },
  },
  
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production',
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
          priority: 5,
        },
        // 分离 React 相关库
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-native)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        // 分离 Expo 相关库
        expo: {
          test: /[\\/]node_modules[\\/]expo[\\/]/,
          name: 'expo',
          chunks: 'all',
          priority: 15,
        },
      },
    },
  },
  
  plugins: [
    // Gzip compression for production
    ...(process.env.NODE_ENV === 'production' ? [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
    ] : []),
  ],
  
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              'babel-plugin-module-resolver',
            ],
            // 开发模式缓存
            cacheDirectory: process.env.NODE_ENV === 'development',
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'images/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // 优化模块解析
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  
  // 开发模式性能优化
  ...(process.env.NODE_ENV === 'development' && {
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    stats: 'errors-only', // 减少控制台输出
  }),
};
