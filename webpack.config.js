const path = require('path');

module.exports = {
  entry: './src/game.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  devServer: {
    static: {
        directory: path.join(__dirname, '/')
    },
    compress: true,
    port: 8080,
  },
  mode: 'development'
}; 