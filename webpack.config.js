const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
  entry: './src/eyetracker.js',
  output: {
    filename: 'deepeyetracker.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,  
        use: [{
            loader: 'url-loader',
            options: { 
                // limit: 8000, // Convert images < 8kb to base64 strings
                name: 'images/[hash]-[name].[ext]'
            } 
        }]
      },
      // {
      //   test:/\.bin$/i,
      //   // use:'raw-loader',
      //   exclude: /node_modules/,
      //   use: [
      //     {
      //       loader: 'url-loader',
      //       options: {
      //         encoding: false,
      //         mimetype: false,
      //         generator: (content) => {
      //           return content;
      //         }
      //       },
      //     },
      //   ],
      // },
      // {
      //   test:/\.bin$/i,
      //   use:["binary-loader"]
      // },
    //   {
    //     test: /\.(png|svg|jpg|jpeg|gif)$/i,
    //     type: 'asset/resource',
    //   },
    ],
    // loaders: [
    //     {
    //         test: /\.(png|jpg)$/i,
    //         loader: 'file?name=[path][name].[ext]',
    //         include: path.resolve(__dirname, 'src/img')
    //     },
    // ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/models/", to: "./models/" },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
        "crypto": false,
        "util": false,
        "node-fetch":false,
        "fs":false,
        "buffer": false
    },
    modules:[
      'node_modules'
    ]

  },
};
