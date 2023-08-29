import { Steps } from '@/components/Steps'
import { DocumentationLayout } from '@/layouts/DocumentationLayout'
import { InstallationLayout } from '@/pages/docs/installation/InstallationLayout'
import Link from 'next/link'

let steps = [
  {
    title: '构建后端服务',
    body: () => (
      <>
        <p>
           我们的后端服务器使用 Go 语言开发，因此你需要先安装 <Link href="https://go.dev/dl/">Go 语言</Link>的环境.
        </p>
        <p>
           然后在 `DatavRoot/backend` 目录下运行右边的命令.
        </p>
      </>
    ),
    code: {
      name: 'DatavRoot/backend',
      lang: 'terminal',
      code: `go build -o datav`,
    },
  },
  {
    title: '启动服务端',
    body: () => (
      <>
        <p>
          在 `DatavRoot/backend` 目录下, 运行上一步编译出的二进制可执行文件 `datav`。
        </p>
        <p>
          你可以看到如右边的输出，这意味着我们的后端服务已经成功启动。
        </p>
      </>
    ),
    code: {
      name: 'DatavRoot/backend',
      lang: 'terminal',
      code: `./datav --config config.yaml
INFO[08-22|13:40:25] Datav is listening on address            address=:10086`,
    },
  },
  {
    title: '构建前端 UI',
    body: () => (
      <p>
        打开一个新的终端窗口，进入 `DatavRoot/ui` 目录, 然后运行右边的命令来安装依赖。
      </p>
    ),
    code: {
      name: 'DataRoot/ui',
      lang: 'terminal',
      code: `nvm use node
yarn install`,
    },
  },
  {
    title: '启动前端的 dev 服务器',
    body: () => <p>由于我们是在开发环境使用，可以直接启动前端的 `ViteJS` dev server。</p>,
    code: {
      name: 'DataRoot/ui',
      lang: 'terminal',
      code: `vite
➜  Vite Local:   http://127.0.0.1:5173/`
    },
  },
]

export default function TailwindCli({ code }) {
  return (
    <InstallationLayout>
      <div
        id="content-wrapper"
        className="relative z-10 max-w-3xl mb-16 prose prose-slate dark:prose-dark"
      >
        <h3 className="sr-only">Installing Datav</h3>
        <p>
          从源码构建和运行 Datav 非常简单，首先下载 `release` 版本的源码 <Link href="https://github.com/data-observe/datav/releases">Github</Link>.
        </p>
      </div>
      <Steps level={4} steps={steps} code={code} />
      
      <div>
      <h2 className="text-slate-900 text-xl tracking-tight font-bold mb-3 dark:text-slate-200">
          打开浏览器来访问下试试
        </h2>
        <p>至此，安装已全部完成，是不是很简单？ 打开你的谷歌或 Safari 浏览器并访问 <Link href="http://localhost:5173">http://localhost:5173</Link> ，此时一个欢迎界面应该已呈现在你眼前。</p>
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

TailwindCli.layoutProps = {
  meta: {
    title: 'Installation',
  },
  Layout: DocumentationLayout,
  allowOverflow: false,
}
