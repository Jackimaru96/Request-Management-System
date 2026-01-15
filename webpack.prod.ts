import path from "path";
import webpack, { Configuration } from "webpack";
import merge from "webpack-merge";

import commonConfig from "./webpack.common";
const { ModuleFederationPlugin } = webpack.container;

const prodConfig: Configuration = merge(commonConfig, {
  mode: "production",
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "bundle.js",
  },
  performance: {
    hints: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      exposes: {},
    }),
  ],
});

export default prodConfig;
