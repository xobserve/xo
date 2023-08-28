import * as path from 'path'
import { createLoader } from 'simple-functional-loader'
import frontMatter from 'front-matter'
import withSmartQuotes from '@silvenon/remark-smartypants'
import { withTableOfContents } from './remark/withTableOfContents.mjs'
import { withSyntaxHighlighting } from './remark/withSyntaxHighlighting.mjs'
import { withLinkRoles } from './rehype/withLinkRoles.mjs'
import minimatch from 'minimatch'
import withExamples from './remark/withExamples.mjs'
import {
  highlightCode,
  fixSelectorEscapeTokens,
  simplifyToken,
  normalizeTokens,
} from './remark/utils.mjs'
import remarkGfm from 'remark-gfm'
import remarkUnwrapImages from 'remark-unwrap-images'
import { recmaImportImages } from './recma/importImages.mjs'
import resolveConfig from 'tailwindcss/resolveConfig.js'
import tailwindDefaultConfig from 'tailwindcss/defaultConfig.js'
import dlv from 'dlv'
import Prism from 'prismjs'
import corePlugins from 'tailwindcss/lib/corePlugins.js'
import * as fs from 'fs'
import negateValue from 'tailwindcss/lib/util/negateValue.js'
import nameClass from 'tailwindcss/lib/util/nameClass.js'
import { createRequire } from 'node:module'
import * as url from 'node:url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const require = createRequire(import.meta.url)

const defaultConfig = resolveConfig(tailwindDefaultConfig)

const fallbackLayouts = {
  'src/pages/docs/**/*': ['@/layouts/DocumentationLayout', 'DocumentationLayout'],
}

const fallbackDefaultExports = {
  'src/pages/{docs,components}/**/*': ['@/layouts/ContentsLayout', 'ContentsLayout'],
  'src/pages/blog/**/*': ['@/layouts/BlogPostLayout', 'BlogPostLayout'],
  'src/pages/showcase/**/*': ['@/layouts/ShowcaseLayout', 'ShowcaseLayout'],
}

const fallbackGetStaticProps = {}

export default {
  swcMinify: true,
  pageExtensions: ['js', 'jsx', 'mdx'],
  experimental: {
    esmExternals: false,
  },
  async redirects() {
    return JSON.parse(fs.readFileSync(require.resolve('./redirects.json'), 'utf8'))
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mp4$/i,
      issuer: /\.(jsx?|tsx?|mdx)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[sha1:hash].[ext]',
          },
        },
      ],
    })

    config.resolve.alias['defaultConfig$'] = require.resolve('tailwindcss/defaultConfig')
    config.module.rules.push({
      test: require.resolve('tailwindcss/defaultConfig'),
      use: createLoader(function (_source) {
        return `export default ${JSON.stringify(defaultConfig)}`
      }),
    })

    config.resolve.alias['utilities$'] = require.resolve('tailwindcss/lib/corePlugins.js')

    // import utilities from 'utilities?plugin=backgroundColor'
    config.module.rules.push({
      resourceQuery: /plugin/,
      test: require.resolve('tailwindcss/lib/corePlugins.js'),
      use: createLoader(function (_source) {
        let pluginName = new URLSearchParams(this.resourceQuery).get('plugin')
        let plugin = corePlugins.corePlugins[pluginName]
        return `export default ${JSON.stringify(getUtilities(plugin))}`
      }),
    })

    config.module.rules.push({
      resourceQuery: /examples/,
      test: require.resolve('tailwindcss/lib/corePlugins.js'),
      use: createLoader(function (_source) {
        let plugins = corePlugins.corePlugins
        let examples = Object.entries(plugins).map(([name, plugin]) => {
          let utilities = getUtilities(plugin)
          return {
            plugin: name,
            example:
              Object.keys(utilities).length > 0
                ? Object.keys(utilities)
                    [Math.floor((Object.keys(utilities).length - 1) / 2)].split(/[>:]/)[0]
                    .trim()
                    .substr(1)
                    .replace(/\\/g, '')
                : undefined,
          }
        })
        return `export default ${JSON.stringify(examples)}`
      }),
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        { loader: '@svgr/webpack', options: { svgoConfig: { plugins: { removeViewBox: false } } } },
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[sha1:hash].[ext]',
          },
        },
      ],
    })

    // Remove the 3px deadzone for drag gestures in Framer Motion
    config.module.rules.push({
      test: /node_modules\/framer-motion/,
      use: createLoader(function (source) {
        return source.replace(
          /var isDistancePastThreshold = .*?$/m,
          'var isDistancePastThreshold = true'
        )
      }),
    })

    config.module.rules.push({
      resourceQuery: /fields/,
      use: createLoader(function (source) {
        let fields = new URLSearchParams(this.resourceQuery).get('fields').split(',')
        return JSON.stringify(JSON.parse(source), (key, value) => {
          return ['', ...fields].includes(key) ? value : undefined
        })
      }),
    })

    config.module.rules.push({
      resourceQuery: /highlight/,
      use: [
        options.defaultLoaders.babel,
        createLoader(function (source) {
          let lang =
            new URLSearchParams(this.resourceQuery).get('highlight') ||
            this.resourcePath.split('.').pop()
          let isDiff = lang.startsWith('diff-')
          let prismLang = isDiff ? lang.substr(5) : lang
          let grammar = Prism.languages[isDiff ? 'diff' : prismLang]
          let tokens = Prism.tokenize(source, grammar, lang)

          if (lang === 'css') {
            fixSelectorEscapeTokens(tokens)
          }

          return `
            export const tokens = ${JSON.stringify(tokens.map(simplifyToken))}
            export const lines = ${JSON.stringify(normalizeTokens(tokens))}
            export const code = ${JSON.stringify(source)}
            export const highlightedCode = ${JSON.stringify(highlightCode(source, lang))}
          `
        }),
      ],
    })

    let mdx = (plugins = []) => [
      {
        loader: '@mdx-js/loader',
        options:
          plugins === null
            ? { providerImportSource: '@mdx-js/react' }
            : {
                providerImportSource: '@mdx-js/react',
                remarkPlugins: [
                  remarkGfm,
                  remarkUnwrapImages,
                  withExamples,
                  withTableOfContents,
                  withSyntaxHighlighting,
                  withSmartQuotes,
                  ...plugins,
                ],
                rehypePlugins: [withLinkRoles],
                recmaPlugins: [[recmaImportImages, { property: 'src' }]],
              },
      },
      createLoader(function (source) {
        let pathSegments = this.resourcePath.split(path.sep)
        let slug =
          pathSegments[pathSegments.length - 1] === 'index.mdx'
            ? pathSegments[pathSegments.length - 2]
            : pathSegments[pathSegments.length - 1].replace(/\.mdx$/, '')
        return source + `\n\nexport const slug = '${slug}'`
      }),
    ]

    config.module.rules.push({
      test: { and: [/\.md$/, /snippets/] },
      resourceQuery: { not: [/rss/, /preview/] },
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            providerImportSource: '@mdx-js/react',
            remarkPlugins: [withSyntaxHighlighting],
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.mdx$/,
      resourceQuery: /rss/,
      use: [options.defaultLoaders.babel, ...mdx()],
    })

    config.module.rules.push({
      test: /\.mdx$/,
      resourceQuery: /preview/,
      use: [
        options.defaultLoaders.babel,
        createLoader(function (src) {
          const [preview] = src.split('{/*/excerpt*/}')
          return preview.replace('{/*excerpt*/}', '')
        }),
        ...mdx([
          () => (tree) => {
            let firstParagraphIndex = tree.children.findIndex((child) => child.type === 'paragraph')
            if (firstParagraphIndex > -1) {
              tree.children = tree.children.filter((child, index) => {
                if (child.type === 'import' || child.type === 'export') {
                  return true
                }
                return index <= firstParagraphIndex
              })
            }
          },
        ]),
      ],
    })

    function mainMdxLoader(plugins) {
      return [
        options.defaultLoaders.babel,
        createLoader(function (source) {
          if (source.includes('/*START_META*/')) {
            let match = source.match(/^export const meta = (\{.*?\n\})/ms)
            return 'export default ' + match[1]
          }
          let exports = Array.from(source.matchAll(/^export const ([^=\s]+)/gm)).map(
            ([, name]) => name
          )
          return (
            source.replace(/export const/gs, 'const') +
            `\nMDXContent.layoutProps = { ${exports.join(',')} }\n`
          )
        }),
        ...mdx(plugins),
        createLoader(function (source) {
          let fields = new URLSearchParams(this.resourceQuery.substr(1)).get('meta') ?? undefined
          let { attributes: meta, body } = frontMatter(source)
          if (fields) {
            for (let field in meta) {
              if (!fields.split(',').includes(field)) {
                delete meta[field]
              }
            }
          }

          let extra = []
          let resourcePath = path.relative(__dirname, this.resourcePath)

          if (!/^\s*export\s+(var|let|const)\s+Layout\s+=/m.test(source)) {
            for (let glob in fallbackLayouts) {
              if (minimatch(resourcePath, glob)) {
                extra.push(
                  `import { ${fallbackLayouts[glob][1]} as _Layout } from '${fallbackLayouts[glob][0]}'`,
                  'export const Layout = _Layout'
                )
                break
              }
            }
          }

          if (!/^\s*export\s+default\s+/m.test(source.replace(/```(.*?)```/gs, ''))) {
            for (let glob in fallbackDefaultExports) {
              if (minimatch(resourcePath, glob)) {
                extra.push(
                  `import { ${fallbackDefaultExports[glob][1]} as _Default } from '${fallbackDefaultExports[glob][0]}'`,
                  'export default _Default'
                )
                break
              }
            }
          }

          if (
            !/^\s*export\s+(async\s+)?function\s+getStaticProps\s+/m.test(
              source.replace(/```(.*?)```/gs, '')
            )
          ) {
            for (let glob in fallbackGetStaticProps) {
              if (minimatch(resourcePath, glob)) {
                extra.push(`export { getStaticProps } from '${fallbackGetStaticProps[glob]}'`)
                break
              }
            }
          }

          let metaExport
          if (!/export\s+(const|let|var)\s+meta\s*=/.test(source)) {
            metaExport =
              typeof fields === 'undefined'
                ? `export const meta = ${JSON.stringify(meta)}`
                : `export const meta = /*START_META*/${JSON.stringify(meta || {})}/*END_META*/`
          }

          return [
            ...(typeof fields === 'undefined' ? extra : []),
            typeof fields === 'undefined'
              ? body.replace(/\{\/\*excerpt\*\/\}.*\{\/\*\/excerpt\*\/\}/s, '')
              : '',
            metaExport,
          ]
            .filter(Boolean)
            .join('\n\n')
        }),
      ]
    }

    config.module.rules.push({
      test: { and: [/\.mdx$/], not: [/snippets/] },
      resourceQuery: { not: [/rss/, /preview/] },
      exclude: [path.join(__dirname, 'src/pages/showcase/')],
      use: mainMdxLoader(),
    })

    config.module.rules.push({
      test: /\.mdx$/,
      include: [path.join(__dirname, 'src/pages/showcase/')],
      use: mainMdxLoader(null),
    })

    return config
  },
}

function normalizeProperties(input) {
  if (typeof input !== 'object') return input
  if (Array.isArray(input)) return input.map(normalizeProperties)
  return Object.keys(input).reduce((newObj, key) => {
    let val = input[key]
    let newVal = typeof val === 'object' ? normalizeProperties(val) : val
    newObj[key.replace(/([a-z])([A-Z])/g, (m, p1, p2) => `${p1}-${p2.toLowerCase()}`)] = newVal
    return newObj
  }, {})
}

function getUtilities(plugin, { includeNegativeValues = false } = {}) {
  if (!plugin) return {}
  const utilities = {}

  function addUtilities(utils) {
    utils = Array.isArray(utils) ? utils : [utils]
    for (let i = 0; i < utils.length; i++) {
      for (let prop in utils[i]) {
        for (let p in utils[i][prop]) {
          if (p.startsWith('@defaults')) {
            delete utils[i][prop][p]
          }
        }
        utilities[prop] = normalizeProperties(utils[i][prop])
      }
    }
  }

  plugin({
    addBase: () => {},
    addDefaults: () => {},
    addComponents: () => {},
    corePlugins: () => true,
    prefix: (x) => x,
    config: (option, defaultValue) => (option ? defaultValue : { future: {} }),
    addUtilities,
    theme: (key, defaultValue) => dlv(defaultConfig.theme, key, defaultValue),
    matchUtilities: (matches, { values, supportsNegativeValues } = {}) => {
      if (!values) return

      let modifierValues = Object.entries(values)

      if (includeNegativeValues && supportsNegativeValues) {
        let negativeValues = []
        for (let [key, value] of modifierValues) {
          let negatedValue = negateValue.default(value)
          if (negatedValue) {
            negativeValues.push([`-${key}`, negatedValue])
          }
        }
        modifierValues.push(...negativeValues)
      }

      let result = Object.entries(matches).flatMap(([name, utilityFunction]) => {
        return modifierValues
          .map(([modifier, value]) => {
            let declarations = utilityFunction(value, {
              includeRules(rules) {
                addUtilities(rules)
              },
            })

            if (!declarations) {
              return null
            }

            return {
              [nameClass.default(name, modifier)]: declarations,
            }
          })
          .filter(Boolean)
      })

      for (let obj of result) {
        for (let key in obj) {
          let deleteKey = false
          for (let subkey in obj[key]) {
            if (subkey.startsWith('@defaults')) {
              delete obj[key][subkey]
              continue
            }
            if (subkey.includes('&')) {
              result.push({
                [subkey.replace(/&/g, key)]: obj[key][subkey],
              })
              deleteKey = true
            }
          }

          if (deleteKey) delete obj[key]
        }
      }

      addUtilities(result)
    },
  })
  return utilities
}
