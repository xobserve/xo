import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { InstallationLayout } from '@/layouts/InstallationLayout'
import { Steps } from '@/components/Steps'
import Link from 'next/link'
import Code  from '@/components/docs/Code'

let steps = [
  {
    title: 'Configure listening address for datav server( optional )',
    body: () => (
      <p>
        Now, we need to configure a listening address for our Datav api server and static file server of UI. The default address is `localhost:10086`
      </p>
    ),
    code: {
      name: 'DatavRoot/datav.yaml',
      lang: 'yaml',
      code: `server:
  ## api server listening address
  ## ip:host
  listening_addr: localhost:10086`,
    },
  },
  {
    title: 'Start Datav',
    body: () => (
      <p>
        Enter the root directory of Datav and run the following command to start Datav server.
      </p>
    ),
    code: {
      name: 'DatavRoot/',
      lang: 'terminal',
      code: `./datav
INFO[08-22|13:40:25] Datav is ready and listening on address=localhost:10086`,
    },
  }
]

export default function Index({ code }) {
  return (
    <InstallationLayout>
      <div
        id="content-wrapper"
        className="relative z-10 max-w-3xl mb-16 prose prose-slate dark:prose-dark"
      >
        <h3 className="sr-only"></h3>
        <p>
          Datav provides pre-built binary and UI static files for every release, you can download them in  <Link href="https://github.com/data-observe/datav/releases">Github</Link>.
        </p>
        <p>
          Pre-built binary files are very convenient for users to use, but they are not suitable for developers to develop and debug. If you want to develop Datav, you need to build the source code yourself.
        </p>
      </div>

      <Steps level={4} steps={steps} code={code} />

      <div>
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          Try Datav in browser
        </h2>
        <p>That's it, all we need to do is configuring a listening address  and start `Datav`, it's super easy. Now you can open Chrome or Safari browser and visit <Code><Link href="http://localhost:10086">http://localhost:10086</Link></Code> to explore Datav UI.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          Why not require nginx or vite dev server?
        </h2>
        <p>This is because we have a built-in static file server in Datav, and the UI static files you access are provided by this file server. Another important thing is that the API server and file server shares the same address `localhost:10086`, it's very convinient for deploying.</p>
      </div>
      <div className="mt-8">
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          What if I want to points a domain name to UI and api server?
        </h2>
        <p>If your boss want to access Datav when he is not in company, then you should assign an externap ip or domain name to datav, such as `https://mydatav.io`. In this case, you should override the api server address for UI: </p>
        
        <p className="mt-4">Modify `datav.yaml`, set field `override_api_server_addr_for_ui` to `https://mydatav.io`</p>

        <p className="mt-4">Now your api server and UI are both served at `https://mydatav.io`</p>

        <p className="mt-4"><strong>This is not bad, but a much better way is to separate UI static files and api server as below.</strong></p>
      </div>
      <div className="mt-8">
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          What if I want to use nginx for serving UI static files?
        </h2>
        <p>It's a good practice to separate UI static files and API server in production environment. If you have such requirements, please read the next installation tab <Code><Link href="/docs/installation/deploy-ui">Deploy UI your separately from API server</Link></Code></p>
      </div>
    </InstallationLayout>
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

Index.layoutProps = {
  meta: {
    title: 'Prebuilt binary',
    description:
      '',
    section: 'Getting Started',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
