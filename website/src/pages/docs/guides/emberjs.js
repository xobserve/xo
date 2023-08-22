import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { FrameworkGuideLayout } from '@/layouts/FrameworkGuideLayout'
import { Steps } from '@/components/Steps'

let steps = [
  {
    title: 'Create your project',
    body: () => (
      <p>
        Start by creating a new Ember.js project if you don't have one set up already. The most
        common approach is to use{' '}
        <a href="https://guides.emberjs.com/release/getting-started/quick-start/#toc_create-a-new-application">
          Ember CLI
        </a>
        .
      </p>
    ),
    code: {
      name: 'Terminal',
      lang: 'terminal',
      code: 'npx ember-cli new my-project --embroider --no-welcome\ncd my-project',
    },
  },
  {
    title: 'Install Tailwind CSS',
    body: () => (
      <p>
        Using npm, install <code>tailwindcss</code> and its peer dependencies, as well as{' '}
        <code>postcss-loader</code>, and then run the <code>init</code> command to generate both{' '}
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
        In your <code>ember-cli-build.js</code> file, configure PostCSS to process your CSS files.
      </p>
    ),
    code: {
      name: 'ember-cli-build.js',
      lang: 'js',
      code: `  'use strict';

  const EmberApp = require('ember-cli/lib/broccoli/ember-app');

  module.exports = function (defaults) {
    const app = new EmberApp(defaults, {
      // Add options here
    });

    const { Webpack } = require('@embroider/webpack');
    return require('@embroider/compat').compatBuild(app, Webpack, {
      skipBabel: [
        {
          package: 'qunit',
        },
      ],
>     packagerOptions: {
>       webpackConfig: {
>         module: {
>           rules: [
>             {
>               test: /\\.css$/i,
>               use: [
>                 {
>                   loader: 'postcss-loader',
>                   options: {
>                     postcssOptions: {
>                       config: 'postcss.config.js',
>                     },
>                   },
>                 },
>               ],
>             },
>           ],
>         },
>       },
>     },
    });
  };`,
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
      lang: 'javascript',
      code: `  /** @type {import('tailwindcss').Config} */
  module.exports = {
>   content: ['./app/**/*.{gjs,gts,hbs,html,js,ts}'],
    theme: {
      extend: {},
    },
    plugins: [],
  };`,
    },
  },
  {
    title: 'Add the Tailwind directives to your CSS',
    body: () => (
      <p>
        Create a <code>./app/app.css</code> file and add the <code>@tailwind</code> directives for
        each of Tailwind's layers.
      </p>
    ),
    code: {
      name: 'app.css',
      lang: 'css',
      code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
  },
  {
    title: 'Import the CSS file',
    body: () => (
      <p>
        Import the newly-created <code>./app/app.css</code> file in your <code>./app/app.js</code>{' '}
        file.
      </p>
    ),
    code: {
      name: 'app.js',
      lang: 'js',
      code: `  import Application from '@ember/application';
  import Resolver from 'ember-resolver';
  import loadInitializers from 'ember-load-initializers';
  import config from 'my-project/config/environment';
> import 'my-project/app.css';

  export default class App extends Application {
    modulePrefix = config.modulePrefix;
    podModulePrefix = config.podModulePrefix;
    Resolver = Resolver;
  }

  loadInitializers(App, config.modulePrefix);`,
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
    body: () => <p>Start using Tailwind's utility classes to style your content.</p>,
    code: {
      name: 'application.hbs',
      lang: 'hbs',
      code: `  {{page-title "MyProject"}}

> <h1 class="text-3xl font-bold underline">
>   Hello world!
> </h1>

  {{outlet}}`,
    },
  },
]

export default function UsingEmberJs({ code }) {
  return (
    <FrameworkGuideLayout
      title="Install Tailwind CSS with Ember.js"
      description="Setting up Tailwind CSS in an Ember.js project."
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

UsingEmberJs.layoutProps = {
  meta: {
    title: 'Install Tailwind CSS With Ember.js',
    description: 'Setting up Tailwind CSS in an Ember.js project.',
    section: 'Getting Started',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
