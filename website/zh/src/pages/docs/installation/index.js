import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { InstallationLayout } from '@/layouts/InstallationLayout'
import { Steps } from '@/components/Steps'
import Link from 'next/link'
import Code  from '@/components/docs/Code'

let steps = [
  {
    title: '为 Datav 服务器配置监听地址',
    body: () => (
      <p>
        在预编译安装包中，提供静态资源的文件服务和提供 API 的服务共享一个端口，因此我们只需要配置一下 Datav api server 的监听端口即可。默认的地址是 `localhost:10086`
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
    title: '启动 Datav',
    body: () => (
      <p>
        进入预编译文件的根目录，运行以下命令启动 Datav server:
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
          Datav 提供了预编译的二进制文件和 UI 静态资源，大家可以从  <Link href="https://github.com/data-observe/datav/releases">Github</Link> 下载 release 的 zip 包.
        </p>
        <p>
          对于用户而言，预编译的文件用起来很简单，不过对于开发者而言，还是建议选择构建本地开发环境，一劳永逸。
        </p>
      </div>

      <Steps level={4} steps={steps} code={code} />

      <div>
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          在浏览器中访问
        </h2>
        <p>如果你不修改默认监听的地址，那其实只要 `./datav` 就能启动服务，超级简单。现在打开浏览器访问 <Code><Link href="http://localhost:10086">http://localhost:10086</Link></Code> 看看效果吧.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          为何不需要 Nginx 或者 Vite dev server 来提供 UI 静态文件的下载?
        </h2>
        <p>原因是在 Datav server 中除了提供 api 服务外，我们同时还内置了静态文件资源服务，最最重要的是它们共享一个端口，因此对于用户来说，是完全无感知的使用。</p>
      </div>
      <div className="mt-8">
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          如果我想将域名指向 UI 和 API server 该怎么做?
        </h2>
        <p>从上面的描述可以看出，UI 静态文件服务和 API server 是共享一个 ip 和端口的，这种对于内网的环境来说不是问题，但是如果你的老板想在路上或者家里看看数据怎么办</p>
        
        <p className="mt-4">此时显然需要两个域名：一个域名用于访问 UI 静态资源，一个域名用于访问 API server，此时我们可以这么做：</p>

        <p className="mt-4">1. 将域名 A，例如 `https://mydatav.io` 指向 API server 的地址，同时也是静态资源文件服务的地址</p>
        <p className="mt-4">2. 修改 `datav.yaml`，将字段 `override_api_server_addr_for_ui` 的值设置为 `https://mydatav.io` </p>

        <p className="mt-4">此时，我们会从 `https://mydatav.io` 下载静态资源，这些网页文件将访问的 API server 地址也是 `https://mydatav.io`</p>

        <p className="mt-4">假如不设置这个资源，UI 网页文件访问的依然是 API server 的监听地址，但是这个地址明显是一个内网地址，是无法在外网访问的。</p>
        <p className="mt-4"><strong>这种方法不赖，但是还是不够灵活，更好的方法是将静态资源和 API server 分离部署。</strong></p>
      </div>
      <div className="mt-8">
        <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          如果我想将 UI 资源分离部署该怎么办？
        </h2>
        <p>一个很好的生产环境部署实践是将 UI 静态资源服务跟 API 服务分离部署，虽然对于 Datav 这样的服务来说这不是必须的，但是如果你有这样的需求，可以看看下一节 <Code><Link href="/docs/installation/deploy-ui">从源码部署</Link></Code></p>
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
    title: '二进制安装包',
    description:
      '',
    section: '开始使用',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
