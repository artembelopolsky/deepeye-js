const path = require('path');

module.exports = {
  entry: './src/eyetracker.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      // "crypto-browserify": require.resolve('crypto-browserify'),
      // "path": require.resolve("path-browserify"),
      // "util": require.resolve("util/"),
      // "stream": require.resolve("stream-browserify"),
      // "url": require.resolve("url/"),
      "crypto-browserify": false,//require.resolve('crypto-browserify'),
      "crypto": false,//require.resolve('crypto-browserify'),
      "http": false,//require.resolve("stream-http"),
      "zlib":false,
      "path": false,
      "util": false,
      "stream": false,
      "url": false,
      "buffer": false,
      "assert": false,
      "child_process":false,
      "fs":false,
      "os":require.resolve('os'),
      "https":false,
      "tls":false,
      "net":false,
      "constants":false,
      "passport":false,
      "http-proxy":false,
      "fsevents":false,
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};