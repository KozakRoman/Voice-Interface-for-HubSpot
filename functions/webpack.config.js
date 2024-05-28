const CopyWebpackPlugin = require("copy-webpack-plugin");
const HubSpotAutoUploadPlugin = require("@hubspot/webpack-cms-plugins/HubSpotAutoUploadPlugin");
const path = require("path");

const fxConfig = ({ portal, autoupload } = {}) => {
  return {
    target: "node",
    entry: {
      "save-call": ["./src/app.functions/save-call.js"],
      "register-call": ["./src/app.functions/register-call.js"]
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "app.functions/[name].js",
      libraryTarget: "umd"
    },
    optimization: {
      minimize: false
    },
    plugins: [
      new HubSpotAutoUploadPlugin({
        portal,
        autoupload,
        src: "dist",
        dest: "feedback-AI-functions"
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/app.functions/serverless.json",
            to: "app.functions/serverless.json"
          }
        ]
      })
    ]
  };
};

module.exports = [fxConfig];
