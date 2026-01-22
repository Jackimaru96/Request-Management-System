import HtmlWebPackPlugin from "html-webpack-plugin";
import webpack, { Configuration, DefinePlugin } from "webpack";

import packageJson from "./package.json";

const { ModuleFederationPlugin } = webpack.container;
const deps = packageJson.dependencies;

const version =
  process.env.CI_COMMIT_TAG ||
  (process.env.CI_COMMIT_SHA
    ? `${process.env.CI_COMMIT_SHA}-${new Date().toISOString()}`
    : "no-hash");

const commonConfig: Configuration = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/i,
        type: "asset/inline",
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "example-application",
      filename: "remoteEntry.js",
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
        "react-router": {
          singleton: true,
          requiredVersion: deps["react-router"],
        },
        "@emotion/react": {
          singleton: true,
          requiredVersion: deps["@emotion/react"],
        },
      },
    }),
    new HtmlWebPackPlugin({
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
      inject: true,
    }),
    new DefinePlugin({
      "process.env.VERSION": JSON.stringify(version),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    }),
  ],
};

export default commonConfig;
