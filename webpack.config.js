const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    mode: "development",
    entry: "./src/main.ts",
    target: "electron-main",
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
    output: {
      path: __dirname + "/dist",
      filename: "main.js",
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: "./src/bin", to: "./bin" }],
      }),
    ],
  },
];
