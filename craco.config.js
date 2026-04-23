const path = require('path');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      // Add background script as a separate entry point
      webpackConfig.entry = {
        main: webpackConfig.entry,
        background: path.resolve(__dirname, 'src/background.ts'),
        content: path.resolve(__dirname, 'src/content.ts'),
      };

      // Extensions don't use runtime chunk splitting
      webpackConfig.optimization.runtimeChunk = false;
      webpackConfig.optimization.splitChunks = { cacheGroups: { default: false } };

      // Stable filenames (no content hash) — extension needs predictable names
      webpackConfig.output.filename = 'static/js/[name].js';
      webpackConfig.output.chunkFilename = 'static/js/[name].chunk.js';

      const miniCssPlugin = webpackConfig.plugins.find(
        (p) => p.constructor.name === 'MiniCssExtractPlugin'
      );
      if (miniCssPlugin) {
        miniCssPlugin.options.filename = 'static/css/[name].css';
        miniCssPlugin.options.chunkFilename = 'static/css/[name].chunk.css';
      }

      // Auto-reload extension on every rebuild (development only)
      if (env === 'development') {
        webpackConfig.plugins.push(
          new ExtensionReloader({
            reloadPage: true,
            entries: {
              background: 'background',
              extensionPage: 'main',
            },
          })
        );
      }

      return webpackConfig;
    },
  },
};
