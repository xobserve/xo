import { useRouteHash } from '@/hooks/useRouteHash'
import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { FrameworkGuideLayout } from '@/layouts/FrameworkGuideLayout'
import { Steps } from '@/components/Steps'
import { TabBar } from '@/components/Guides/TabBar.jsx'

let tabs = [
  {
    name: 'Nuxt 2',
    href: '#2',
    steps: [
      {
        title: 'Create your project',
        body: () => (
          <p>
            Start by creating a new Nuxt.js project if you don’t have one set up already. The most
            common approach is to use{' '}
            <a href="https://nuxtjs.org/guides/get-started/installation">Create Nuxt App</a>.
          </p>
        ),
        code: {
          name: 'Terminal',
          lang: 'terminal',
          code: 'npx create-nuxt-app my-project\ncd my-project',
        },
      },
      {
        title: 'Install Tailwind CSS',
        body: () => (
          <>
            <p>
              Install <code>tailwindcss</code> and its peer dependencies via npm, and then run the
              init command to generate a <code>tailwind.config.js</code> file.
            </p>
          </>
        ),
        code: {
          name: 'Terminal',
          lang: 'terminal',
          code: 'npm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init',
        },
      },
      {
        title: 'Add Tailwind to your PostCSS configuration',
        body: () => (
          <p>
            Add <code>tailwindcss</code> and <code>autoprefixer</code> to the{' '}
            <code>build.postcss.plugins</code> object in your <code>nuxt.config.js</code> file.
          </p>
        ),
        code: {
          name: 'nuxt.config.js',
          lang: 'js',
          code: `  export default {
    build: {
>     postcss: {
>       postcssOptions: {
>         plugins: {
>           tailwindcss: {},
>           autoprefixer: {},
>         },
>       },
>     },
    }
  }`,
        },
      },
      {
        title: 'Configure your template paths',
        body: () => (
          <p>
            Add the paths to all of your template files in your <code>tailwind.config.js</code>{' '}
            file.
          </p>
        ),
        code: {
          name: 'tailwind.config.js',
          lang: 'js',
          code: `  /** @type {import('tailwindcss').Config} */
  module.exports = {
>   content: [
>     "./components/**/*.{js,vue,ts}",
>     "./layouts/**/*.vue",
>     "./pages/**/*.vue",
>     "./plugins/**/*.{js,ts}",
>     "./nuxt.config.{js,ts}",
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
            Create an <code>./assets/css/main.css</code> file and add the <code>@tailwind</code>{' '}
            directives for each of Tailwind’s layers.
          </p>
        ),
        code: {
          name: 'main.css',
          lang: 'css',
          code: '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
        },
      },
      {
        title: 'Import the CSS file',
        body: () => (
          <p>
            Add the newly-created <code>./assets/css/main.css</code> file to the <code>css</code>{' '}
            array in the <code>nuxt.config.js</code> file.
          </p>
        ),
        code: {
          name: 'nuxt.config.js',
          lang: 'js',
          code: `  export default {
    css: [
>     '@/assets/css/main.css',
    ],
  }`,
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
        body: () => <p>Start using Tailwind’s utility classes to style your content.</p>,
        code: {
          name: 'App.vue',
          lang: 'html',
          code: `  <template>
>   <h1 class="text-3xl font-bold underline">
>     Hello world!
>   </h1>
  </template>`,
        },
      },
    ],
  },
  {
    name: 'Nuxt 3',
    href: '#3',
    steps: [
      {
        title: 'Create your project',
        body: () => (
          <p>
            Start by creating a new Nuxt.js project if you don’t have one set up already. The most
            common approach is to use the{' '}
            <a href="https://nuxt.com/docs/getting-started/installation">
              Nuxt Command Line Interface
            </a>
            .
          </p>
        ),
        code: {
          name: 'Terminal',
          lang: 'terminal',
          code: 'npx nuxi init my-project\ncd my-project',
        },
      },
      {
        title: 'Install Tailwind CSS',
        body: () => (
          <p>
            Install <code>tailwindcss</code> and its peer dependencies via npm, and then run the
            init command to generate a <code>tailwind.config.js</code> file.
          </p>
        ),
        code: {
          name: 'Terminal',
          lang: 'terminal',
          code: 'npm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init',
        },
      },
      {
        title: 'Add Tailwind to your PostCSS configuration',
        body: () => (
          <p>
            Add <code>tailwindcss</code> and <code>autoprefixer</code> to the{' '}
            <code>postcss.plugins</code> object in your <code>nuxt.config.js</code> file.
          </p>
        ),
        code: {
          name: 'nuxt.config.js',
          lang: 'js',
          code: `  // https://nuxt.com/docs/api/configuration/nuxt-config
  export default defineNuxtConfig({
>   postcss: {
>     plugins: {
>       tailwindcss: {},
>       autoprefixer: {},
>     },
>   },
  })`,
        },
      },
      {
        title: 'Configure your template paths',
        body: () => (
          <p>
            Add the paths to all of your template files in your <code>tailwind.config.js</code>{' '}
            file.
          </p>
        ),
        code: {
          name: 'tailwind.config.js',
          lang: 'js',
          code: `  /** @type {import('tailwindcss').Config} */
  module.exports = {
>   content: [
>     "./components/**/*.{js,vue,ts}",
>     "./layouts/**/*.vue",
>     "./pages/**/*.vue",
>     "./plugins/**/*.{js,ts}",
>     "./nuxt.config.{js,ts}",
>     "./app.vue",
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
            Create an <code>./assets/css/main.css</code> file and add the <code>@tailwind</code>{' '}
            directives for each of Tailwind’s layers.
          </p>
        ),
        code: {
          name: 'main.css',
          lang: 'css',
          code: '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
        },
      },
      {
        title: 'Add the CSS file globally',
        body: () => (
          <p>
            Add your newly-created <code>./assets/css/main.css</code> to the <code>css</code> array
            in your <code>nuxt.config.js</code> file.
          </p>
        ),
        code: {
          name: 'nuxt.config.js',
          lang: 'js',
          code: `  // https://nuxt.com/docs/api/configuration/nuxt-config
  export default defineNuxtConfig({
>   css: ['~/assets/css/main.css'],
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  })`,
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
        body: () => <p>Start using Tailwind’s utility classes to style your content.</p>,
        code: {
          name: 'app.vue',
          lang: 'html',
          code: `  <template>
>   <h1 class="text-3xl font-bold underline">
>     Hello world!
>   </h1>
  </template>`,
        },
      },
    ],
  },
]

export default function UsingNuxtJs({ code }) {
  let hash = useRouteHash()

  let selectedTabIndex = tabs.findIndex((tab) => tab.href === hash)

  if (selectedTabIndex === -1) {
    selectedTabIndex = 0
  }

  return (
    <FrameworkGuideLayout
      title="Install Tailwind CSS with Nuxt.js"
      description="Setting up Tailwind CSS in a Nuxt.js project."
    >
      <TabBar tabs={tabs} selectedTabIndex={selectedTabIndex} />
      <Steps steps={tabs[selectedTabIndex].steps} code={code[selectedTabIndex]} />
    </FrameworkGuideLayout>
  )
}

export function getStaticProps() {
  let { highlightedCodeSnippets } = require('@/components/Guides/Snippets.js')

  return {
    props: {
      code: tabs.map((tab) => highlightedCodeSnippets(tab.steps)),
    },
  }
}

UsingNuxtJs.layoutProps = {
  meta: {
    title: 'Install Tailwind CSS with Nuxt.js',
    description: 'Setting up Tailwind CSS in a Nuxt.js project.',
    section: 'Installation',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
