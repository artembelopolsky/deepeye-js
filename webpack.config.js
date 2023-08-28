const path = require('path');

module.exports = {
  entry: './src/eyetracker.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
        "crypto": false,
        "util": false,
        "node-fetch":false,
        "fs":false,
    }
  },
};