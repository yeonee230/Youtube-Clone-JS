const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Base_url = "./src/client/js/";

module.exports = {
  entry: {
    main: Base_url + "main.js",
    videoPlayer: Base_url + "videoPlayer.js",
    recorder: Base_url + "recorder.js",
    commentSection: Base_url + "commentSection.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
