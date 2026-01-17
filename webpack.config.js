const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  
  entry: {
    popup: './src/popup/popup.tsx',
    'content-script': './src/scripts/content-script.ts',
    'service-worker': './src/scripts/service-worker.ts'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'public/icon-16.png', to: 'icon-16.png', noErrorOnMissing: true },
        { from: 'public/icon-48.png', to: 'icon-48.png', noErrorOnMissing: true },
        { from: 'public/icon-128.png', to: 'icon-128.png', noErrorOnMissing: true }
      ]
    })
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false
            }
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
};
