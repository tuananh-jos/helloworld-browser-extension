module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Browser extensions don't use runtime chunk splitting
      webpackConfig.optimization.runtimeChunk = false;
      webpackConfig.optimization.splitChunks = { cacheGroups: { default: false } };

      // Rename output files to remove content hash (extension needs stable filenames)
      webpackConfig.output.filename = 'static/js/[name].js';
      webpackConfig.output.chunkFilename = 'static/js/[name].chunk.js';

      const miniCssPlugin = webpackConfig.plugins.find(
        (p) => p.constructor.name === 'MiniCssExtractPlugin'
      );
      if (miniCssPlugin) {
        miniCssPlugin.options.filename = 'static/css/[name].css';
        miniCssPlugin.options.chunkFilename = 'static/css/[name].chunk.css';
      }

      return webpackConfig;
    },
  },
};
