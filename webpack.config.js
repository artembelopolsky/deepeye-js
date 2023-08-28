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
    loaders: [
        {
            test: /\.(png|jpg)$/i,
            loader: 'file?name=[path][name].[ext]',
            include: path.resolve(__dirname, 'src/img')
        },
    ]
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