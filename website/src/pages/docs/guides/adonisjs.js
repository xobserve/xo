import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { FrameworkGuideLayout } from '@/layouts/FrameworkGuideLayout'
import { Steps } from '@/components/Steps'

let steps = [
  {
    title: 'Create your project',
    body: () => (
      <p>
        Start by{' '}
        <a href="https://docs.adonisjs.com/guides/installation">creating a new AdonisJS project</a>{' '}
        if you don’t have one set up already. Choose <code>web</code> for the project structure and{' '}
        <code>y</code> when asked to include Webpack Encore.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm init adonis-ts-app@latest my-project\ncd my-project',
    },
  },
  {
    title: 'Install Tailwind CSS',
    body: () => (
      <p>
        Using npm, install <code>tailwindcss</code> and its peer dependencies, as well as{' '}
        <code>postcss-loader</code>, and then run the init command to generate both{' '}
        <code>tailwind.config.js</code> and <code>postcss.config.js</code>.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm install -D tailwindcss postcss postcss-loader autoprefixer\nnpx tailwindcss init -p',
    },
  },
  {
    title: 'Enable PostCSS support',
    body: () => (
      <p>
        In your <code>webpack.config.js</code> file, enable the PostCSS loader. See the{' '}
        <a href="https://symfony.com/doc/current/frontend/encore/postcss.html">
          Webpack Encore documentation
        </a>{' '}
        for more information.
      </p>
    ),
    code: {
      name: 'webpack.config.js',
      lang: 'js',
      code: `  /*
  |--------------------------------------------------------------------------
  | CSS loaders
  |--------------------------------------------------------------------------
  |
  | Uncomment one of the following line of code to enable support for
  | PostCSS or CSS.
  |
  */
> Encore.enablePostCssLoader();
  // Encore.configureCssLoader(() => {})`,
    },
  },
  {
    title: 'Configure your template paths',
    body: () => (
      <p>
        Add the paths to all of your template files in your <code>tailwind.config.js</code> file.
      </p>
    ),
    code: {
      name: 'tailwind.config.js',
      lang: 'js',
      code: `  /** @type {import('tailwindcss').Config} */
  module.exports = {
>   content: [
>     "./resources/**/*.{edge,js,ts,jsx,tsx,vue}",
>   ],
    theme: {
      extend: {},
    },
    plugins: [],
  }`,
    },
  },
  {
    title: 'Add the Tailwind directives to your CSS',
    body: () => (
      <p>
        Add the <code>@tailwind</code> directives for each of Tailwind’s layers to your{' '}
        <code>./resources/css/app.css</code> file.
      </p>
    ),
    code: {
      name: 'app.css',
      lang: 'css',
      code: '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
    },
  },
  {
    title: 'Start your build process',
    body: () => (
      <p>
        Run your build process with <code>npm run dev</code>.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm run dev',
    },
  },
  {
    title: 'Start using Tailwind in your project',
    body: () => (
      <p>
        Make sure your compiled CSS is included in the <code>{'<head>'}</code> then start using
        Tailwind’s utility classes to style your content.
      </p>
    ),
    code: {
      name: 'welcome.edge',
      lang: 'html',
      code: `  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @entryPointStyles('app')
  </head>
  <body>
>   <h1 class="text-3xl font-bold underline">
>     Hello world!
>   </h1>
  </body>
  </html>`,
    },
  },
]

export default function UsingAdonis({ code }) {
  return (
    <FrameworkGuideLayout
      title="Install Tailwind CSS with AdonisJS"
      description="Setting up Tailwind CSS in an AdonisJS project."
    >
      <Steps steps={steps} code={code} />
    </FrameworkGuideLayout>
  )
}

export function getStaticProps() {
  let { highlightCode } = require('../../../../remark/utils')

  return {
    props: {
      code: steps.map(({ code }) => {
        if (code.lang && code.lang !== 'terminal') {
          return highlightCode(code.code, code.lang)
        }
        return code.code
      }),
    },
  }
}

UsingAdonis.layoutProps = {
  meta: {
    title: 'Install Tailwind CSS with Adonis',
    section: 'Installation',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
