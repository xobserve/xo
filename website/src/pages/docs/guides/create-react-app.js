import Link from 'next/link'
import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { FrameworkGuideLayout } from '@/layouts/FrameworkGuideLayout'
import { Steps } from '@/components/Steps'
import { Cta } from '@/components/Cta'

let steps = [
  {
    title: 'Create your project',
    body: () => (
      <p>
        Start by creating a new React project with{' '}
        <a href="https://create-react-app.dev/docs/getting-started">Create React App v5.0+</a> if
        you don't have one already set up.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npx create-react-app my-project\ncd my-project',
    },
  },
  {
    title: 'Install Tailwind CSS',
    body: () => (
      <p>
        Install <code>tailwindcss</code> via npm, and then run the init command to generate your{' '}
        <code>tailwind.config.js</code> file.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm install -D tailwindcss\nnpx tailwindcss init',
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
>     "./src/**/*.{js,jsx,ts,tsx}",
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
        <code>./src/index.css</code> file.
      </p>
    ),
    code: {
      name: 'index.css',
      lang: 'css',
      code: '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
    },
  },
  {
    title: 'Start your build process',
    body: () => (
      <p>
        Run your build process with <code>npm run start</code>.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm run start',
    },
  },
  {
    title: 'Start using Tailwind in your project',
    body: () => <p>Start using Tailwind’s utility classes to style your content.</p>,
    code: {
      name: 'App.js',
      lang: 'jsx',
      code: `  export default function App() {
    return (
>     <h1 className="text-3xl font-bold underline">
>       Hello world!
>     </h1>
    )
  }`,
    },
  },
]

export default function UsingCRA({ code }) {
  return (
    <FrameworkGuideLayout
      title="Install Tailwind CSS with Create React App"
      description="Setting up Tailwind CSS in a Create React App project."
    >
      <div hidden className="relative z-10 prose prose-slate mb-16 max-w-3xl dark:prose-dark">
        <p>
          We <strong>highly recommend</strong> using <Link href="https://vitejs.dev">Vite</Link>,{' '}
          <Link href="https://nextjs.org">Next.js</Link>,{' '}
          <Link href="https://remix.run">Remix</Link>, or{' '}
          <Link href="https://parceljs.org">Parcel</Link> instead of Create React App. They provide
          an equivalent or better developer experience but with more flexibility, giving you more
          control over how Tailwind and PostCSS are configured. Create React App does not support
          custom PostCSS configurations, so you can't use
        </p>
      </div>

      <div className="mb-16 py-6 px-4 bg-amber-500/10 sm:p-6 lg:p-6 rounded-lg dark:bg-black/25 max-w-4xl">
        <div className="flex">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="fill-amber-900 w-5 h-5 shrink-0 mt-1 mr-4 dark:fill-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>

          <div className="text-sm leading-6 text-amber-900 dark:text-slate-400">
            <p className="font-bold dark:text-slate-200">
              Create React App does not support custom PostCSS configurations and is incompatible
              with many important tools in the PostCSS ecosystem, like{' '}
              <code className="text-xs font-bold">`postcss-import`</code>.
            </p>
            <p className="mt-3">
              We <strong className="dark:text-slate-200">highly recommend</strong> using{' '}
              <Link href="/docs/guides/vite" className="underline font-bold dark:text-slate-200">
                Vite
              </Link>
              ,{' '}
              <Link href="/docs/guides/parcel" className="underline font-bold dark:text-slate-200">
                Parcel
              </Link>
              ,{' '}
              <Link href="/docs/guides/nextjs" className="underline font-bold dark:text-slate-200">
                Next.js
              </Link>
              , or{' '}
              <Link href="/docs/guides/remix" className="underline font-bold dark:text-slate-200">
                Remix
              </Link>{' '}
              instead of Create React App. They provide an equivalent or better developer experience
              but with more flexibility, giving you more control over how Tailwind and PostCSS are
              configured.
            </p>
          </div>
        </div>
      </div>
      <Steps steps={steps} code={code} />
    </FrameworkGuideLayout>
  )
}

export function getStaticProps() {
  let { highlightedCodeSnippets } = require('@/components/Guides/Snippets.js')

  return {
    props: {
      code: highlightedCodeSnippets(steps),
    },
  }
}

UsingCRA.layoutProps = {
  meta: {
    title: 'Install Tailwind CSS with Create React App',
    description: 'Setting up Tailwind CSS in a Create React App project.',
    section: 'Installation',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
