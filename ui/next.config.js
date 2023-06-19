const { NODE_ENV, API, ANALYZE } = process.env

const withPlugins = require("next-compose-plugins")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: ANALYZE === "true",
})

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const withTM = require("next-transpile-modules")([
  // `monaco-editor` isn't published to npm correctly: it includes both CSS
  // imports and non-Node friendly syntax, so it needs to be compiled.
  "monaco-editor"
]);

const isProd = NODE_ENV === 'production'

const defaultConfig = withTM({
  publicRuntimeConfig: {
    env: {
      NODE_ENV,
      API,
    },
  },
  // target: "serverless",
  webpack: (config) => {
    const rule = config.module.rules
      .find(rule => rule.oneOf)
      .oneOf.find(
        r =>
          // Find the global CSS loader
          r.issuer && r.issuer.include && r.issuer.include.includes("_app")
      );
    if (rule) {
      rule.issuer.include = [
        rule.issuer.include,
        // Allow `monaco-editor` to import global CSS:
        /[\\/]node_modules[\\/]monaco-editor[\\/]/
      ];
    }
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: [
          "json",
          "markdown",
          "css",
          "typescript",
          "javascript",
          "html",
          "graphql",
          "python",
          "scss",
          "yaml"
        ],
        filename: "static/[name].worker.js"
      })
    );

    
    return ({
    ...config,
    externals: [...config.externals],
  })},
  experimental: {
    optimizeFonts: true,
    modern: true,
    esmExternals: 'loose'
  },
  redirects: require("./next-redirect"),
  assetPrefix: isProd ? '' : '',
})

module.exports = withPlugins(
  [withBundleAnalyzer],
  defaultConfig,
)
