const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = function (p1, p2) { 
  const mode = (p2?.mode) ? 'production' : 'development';
  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      fallback: {
        "fs": false,
        "path": false
      }
    },
    devServer: {
      static: './public',
      hot: false,
      liveReload: true,
    },
    mode: mode,
    devtool: mode === 'development' ? 'source-map' : false,
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "public", to: "" },
        ],
      }),
    ],
  };
}