import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { FrameworkGuideLayout } from '@/layouts/FrameworkGuideLayout'
import { Steps } from '@/components/Steps'

let steps = [
  {
    title: 'Create your project',
    body: () => (
      <p>
        Start by creating a new Remix project if you don’t have one set up already. The most common
        approach is to use <a href="https://remix.run/docs">Create Remix</a>.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npx create-remix@latest my-project\ncd my-project',
    },
  },
  {
    title: 'Enable built-in Tailwind CSS support in Remix',
    body: () => (
      <p>
        Set the <code>tailwind</code> flag in your <code>remix.config.js</code> file.
      </p>
    ),
    code: {
      name: 'remix.config.js',
      lang: 'js',
      code: `  /** @type {import('@remix-run/dev').AppConfig} */
  module.exports = {
>   tailwind: true,
  }`,
    },
  },
  {
    title: 'Install Tailwind CSS',
    body: () => (
      <p>
        Install <code>tailwindcss</code> via npm, and then run the init command to generate a{' '}
        <code>tailwind.config.ts</code> file.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm install -D tailwindcss\nnpx tailwindcss init --ts',
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
      name: 'tailwind.config.ts',
      lang: 'ts',
      code: `  import type { Config } from 'tailwindcss'

  export default {
>   content: ['./app/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {},
    },
    plugins: [],
  } satisfies Config`,
    },
  },
  {
    title: 'Add the Tailwind directives to your CSS',
    body: () => (
      <p>
        Create a <code>./app/tailwind.css</code> file and add the <code>@tailwind</code> directives
        for each of Tailwind’s layers.
      </p>
    ),
    code: {
      name: 'tailwind.css',
      lang: 'css',
      code: '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
    },
  },
  {
    title: 'Import the CSS file',
    body: () => (
      <p>
        Import the newly-created <code>./app/tailwind.css</code> file in your{' '}
        <code>./app/root.jsx</code> file.
      </p>
    ),
    code: {
      name: 'root.tsx',
      lang: 'tsx',
      code: `import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];`,
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
      name: 'index.tsx',
      lang: 'tsx',
      code: `  export default function Index() {
    return (
>     <h1 className="text-3xl font-bold underline">
>       Hello world!
>     </h1>
    )
  }`,
    },
  },
]

export default function UsingRemix({ code }) {
  return (
    <FrameworkGuideLayout
      title="Install Tailwind CSS with Remix"
      description="Setting up Tailwind CSS in a Remix project."
    >
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

UsingRemix.layoutProps = {
  meta: {
    title: 'Install Tailwind CSS with Remix',
    description: 'Setting up Tailwind CSS in a Remix project.',
    section: 'Installation',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
