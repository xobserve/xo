import { Steps } from '@/components/Steps'
import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { InstallationLayout } from '@/layouts/InstallationLayout'
import Link from 'next/link'
import Code from '@/components/docs/Code'

let steps = [
    {
        title: '配置 UI 要访问的 API server 地址',
        body: () => (
            <>
                <p>
                    由于现在 UI 和 API server 分离部署了，因此我们的 UI 文件必须要配置要访问的 API server 地址.
                </p>
                <p>由于我们的 API 服务器运行在 <Code> http://10.7.10.10 </Code> 上，你可以配置 UI 访问的地址为该 IP ，也可以是一个指向该 IP 的域名，例如 `https://api.datav.io`</p>

                <p>
                    在 `ui` 文件夹下找到 `.env` 文件，修改内容为:
                </p>
            </>
        ),
        code: {
            name: 'SourceCodeRoot/ui/.env',
            lang: 'env',
            code: `VITE_API_SERVER_PROD=http://10.7.10.10 `,
        },
    },
    {
        title: '构建发布文件',
        body: () => (
            <p>
                在修改完配置后，就可以调用 `release.sh` 构建我们需要的发布文件了，在源代码的根目录下调用：
            </p>
        ),
        code: {
            name: 'SourceCodeRoot',
            lang: 'terminal',
            code: `./release.sh`
        },
    },
    {
        title: '发布文件目录',
        body: () => (
            <>
                <p>
                    当构建发布完成后，你将在源代码根目录下，看到一个新出现的 `release` 文件夹。
                </p>
                <p> 
                    该文件夹下有三个 `.zip` 压缩文件，选择你需要的进行解压，下面我们以 linux 为例来进行解压，解压后你将看到如下文件:
                </p>
                <p>
                    1. <Code>datav</Code>: Go语言编译出的二进制文件，用于启动 Datav server( API server ).
                </p>
                <p>
                    2. <Code>datav.yaml</Code>: Datav server 需要的配置文件
                </p>
                <p>
                    3. <Code>datav.sql</Code>: Mysql 数据库需要的 sql 文件
                </p>
                <p>
                    4. <Code>ui directory</Code>: UI 静态资源文件，你可以将其部署在 Nginx 或 Github 上
                </p>
            </>
        ),
        code: {
            name: 'SourceCodeRoot/release/linux',
            lang: 'terminal',
            code: `linux % ls
datav		datav.sql	datav.yaml	ui`,
        },
    },
    {
        title: '部署 Datav api server',
        body: () => (
            <>
                <p>
                    拷贝 `datav` 二进制文件和 `datav.yaml` 到服务器 `10.7.10.10` 上, 按照右边的配置修改 `datav.yaml` 并启动服务: `./datav --config datav.yaml`
                </p>
            </>
        ),
        code: {
            name: '10.7.10.10/datav.yaml',
            lang: 'terminal',
            code: `server:
    ## datav server address
    addr: "10.7.10.10:80"`
        },
    },
    {
        title: '部署 UI',
        body: () => (
            <p>
                现在，我们可以将`ui` 目录中的静态资源文件部署到位于 `http://10.7.10.11` 服务器上的 `Nginx` 中, 关于这方面的资料网上很多，这里就不再赘述。 
            </p>
        ),
        code: {
            name: '10.7.10.11/nginx',
            lang: 'terminal',
            code: `Deploy static files in release/ui directory  to nginx`
        },
    },
]

export default function Index({ code }) {
    return (
        <InstallationLayout>
            <div
                id="content-wrapper"
                className="relative z-10 max-w-3xl mb-16 prose prose-slate dark:prose-dark"
            >
                <h3 className="sr-only">Installing Datav</h3>
                <p>
                    在本节中，我们将在不同的服务器上部署 UI 静态资源和 API server。
                </p>
                <p>
                事实上 `https://play.datav.io` 就是分离部署的：UI 静态文件部署在 <Link href="https://github.com/data-observe/play.datav.io">Github page</Link> 上，API server 部署在云服务器，其中 `play.datav.io` 指向 Github page, `api.datav.io` 指向 API server。
                    当用户从 `play.datav.io` 访问 UI 时，会先从 Github page 上下载静态资源文件，然后这些文件会请求 `api.datav.io` 获取数据。
                </p>
                <p>
                    首先，需要从 <Link href="https://github.com/data-observe/datav/releases">Github</Link> 上下载 Datav 的<strong>源代码( source code)</strong>，注意，不是 zip 安装包。然后准备两台服务器用于部署 Datav:
                </p>
                <p>1. <strong>10.7.10.10</strong> 上部署 datav server 也就是 api server</p>
                <p>2. <strong>10.7.10.11</strong> 上部署 UI 静态资源( 通过 nginx 提供)</p>
            </div>
            <Steps level={4} steps={steps} code={code} />

            <div>
                <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
                    在浏览器中访问
                </h2>
                <p>相比之前的安装部署，本节的内容更加复杂，但是如果你熟悉 Web 开发，那其实这个过程也挺简单的，现在打开浏览器访问部署在 Nginx 上的网页 <Code><Link href="http://10.7.10.11">http://10.7.10.11</Link></Code> .</p>
                <p className="mt-4">如果打开 Chrome 的检查器，可以看到 UI 在从 API 服务器 http://10.7.10.10 加载数据</p>
            </div>
            {/*
        <Cta
          label="Read the documentation"
          href="/docs/tailwind-cli"
          description={
            <>
              <strong className="font-semibold text-slate-900">
                This is only the beginning of what’s possible with the Tailwind CLI.
              </strong>{' '}
              To learn more about everything it can do, check out the Tailwind CLI documentation.
            </>
          }
        />
      */}
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
      title: '从源码部署',
      description:
        '',
      section: '开始使用',
    },
    Layout: DocumentationLayout,
    allowOverflow: false,
  }