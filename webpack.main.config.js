const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  entry: path.resolve(__dirname, 'src', 'main', 'main.js'),
  output: {
    path: path.resolve(__dirname, 'dist', 'main'),
    filename: 'index.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@main': path.resolve(__dirname, 'src', 'main'),
      '@preload': path.resolve(__dirname, 'src', 'preload'),
      '@shared': path.resolve(__dirname, 'src', 'shared')
    }
  },
  module: {
    rules: []
  }
};
