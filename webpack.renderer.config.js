const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: path.resolve(__dirname, 'src', 'renderer', 'index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist', 'renderer'),
    filename: 'renderer.bundle.js',
    publicPath: '/' 
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@renderer': path.resolve(__dirname, 'src', 'renderer'),
      '@shared': path.resolve(__dirname, 'src', 'shared')
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(css)$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'renderer', 'index.html'),
      filename: 'index.html'
    })
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist', 'renderer')
    },
    port: 3000,
    hot: true,
    historyApiFallback: true
  }
};
