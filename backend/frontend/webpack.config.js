const { defineConfig } = require('@vitejs/plugin-react');
const react = require('@vitejs/plugin-react');
const { resolve } = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.tsx',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'assets/[name]-[hash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name]-[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new (require('html-webpack-plugin'))({
      template: './index.html',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
