import path from "path";
import webpack, { Configuration } from "webpack";
import { Configuration as DevServerConfiguration } from "webpack-dev-server";
import merge from "webpack-merge";

import commonConfig from "./webpack.common";
const { ModuleFederationPlugin } = webpack.container;

interface DevConfiguration extends Configuration {
  devServer?: DevServerConfiguration;
}

const devConfig: DevConfiguration = merge(commonConfig, {
  mode: "development",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/", // need this parameter to show page on refresh
  },
  devServer: {
    client: {
      overlay: true,
    },
    hot: true,
    port: 3000,
    historyApiFallback: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      exposes: {},
    }),
  ],
});

export default devConfig;
