const { NODE_ENV, API, ANALYZE } = process.env
const { patchWebpackConfig } = require("next-global-css");


const withPlugins = require("next-compose-plugins")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: ANALYZE === "true",
})

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const withTM = require("next-transpile-modules")([
  // `monaco-editor` isn't published to npm correctly: it includes both CSS
  // imports and non-Node friendly syntax, so it needs to be compiled.
  "monaco-editor","echarts","zrender"
]);

const isProd = NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const defaultConfig = withTM({
  publicRuntimeConfig: {
    env: {
      NODE_ENV,
      API,
    },
  },
  // target: "serverless",
  webpack: (config,options) => {
     // allow global CSS to be imported from within node_modules
    // see also:
    //   - https://nextjs.org/docs/messages/css-npm
    //   - https://github.com/vercel/next.js/discussions/27953
    patchWebpackConfig(config, options);

    // const rule = config.module.rules
    //   .find(rule => rule.oneOf)
    //   .oneOf.find(
    //     r =>
    //       // Find the global CSS loader
    //       r.issuer && r.issuer.include && r.issuer.include.includes("_app")
    //   );
    // if (rule) {
    //   rule.issuer.include = [
    //     rule.issuer.include,
    //     // Allow `monaco-editor` to import global CSS:
    //     /[\\/]node_modules[\\/]monaco-editor[\\/]/
    //   ];
    // }
       // when `isServer` is `true`, building (`next build`) fails with the following error:
    // "Conflict: Multiple assets emit different content to the same filename ../main.js.nft.json"
    if (!options.isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript", "typescript"],
          filename: "static/[name].worker.js",
        })
      );
    }
    
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
