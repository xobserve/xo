import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { FrameworkGuideLayout } from '@/layouts/FrameworkGuideLayout'
import { Steps } from '@/components/Steps'

let steps = [
  {
    title: 'Create your project',
    body: () => (
      <p>
        Start by creating a new Astro project if you don't have one set up already. The most common
        approach is to use{' '}
        <a href="https://docs.astro.build/en/getting-started/#start-your-first-project">
          create astro
        </a>
        .
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npm create astro@latest my-project\ncd my-project',
    },
  },
  {
    title: 'Install Tailwind CSS',
    body: () => (
      <p>
        Run the <code>astro add</code> command to install both <code>tailwindcss</code> and{' '}
        <code>@astro/tailwind</code> as well as generate a <code>tailwind.config.cjs</code> file.
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npx astro add tailwind',
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
    body: () => <p>Start using Tailwind's utility classes to style your content.</p>,
    code: {
      name: 'index.astro',
      lang: 'html',
      code: `<h1 class="text-3xl font-bold underline">
  Hello world!
</h1>`,
    },
  },
]

export default function UsingAstro({ code }) {
  return (
    <FrameworkGuideLayout
      title="Install Tailwind CSS with Astro"
      description="Setting up Tailwind CSS in an Astro project."
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

UsingAstro.layoutProps = {
  meta: {
    title: 'Install Tailwind CSS with Astro',
    description: 'Setting up Tailwind CSS in an Astro project.',
    section: 'Getting Started',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
