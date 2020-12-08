import { SidebarLayout } from '@/layouts/SidebarLayout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import twitterSquare from '@/img/twitter-square.jpg'
import { Title } from '@/components/Title'
import { createPageList } from '@/utils/createPageList'


export function DocumentationLayout(props) {
  const router = useRouter()
  let lang = 'en_US'
  if (router.pathname.indexOf('/docs-cn') !== -1) {
    lang = 'zh_CN'
  }

  let pages;
  if (lang === 'zh_CN') {
    pages = createPageList(
      require.context(`../pages/docs-cn/?meta=title,shortTitle,published`, false, /\.mdx$/),
      'docs-cn'
    )
  } else {
    pages = createPageList(
      require.context(`../pages/docs/?meta=title,shortTitle,published`, false, /\.mdx$/),
      'docs'
    )
  }

  let nav;
  if (lang === 'zh_CN') {
    nav = {
      '快速开始': [
        pages['installation'],
        pages['tutorial'],
      ],
      '初级教程': [
        pages['lang-theme'],
        pages['create-datasource'],
        pages['create-dashboard'],
        pages['search-dashboard'],
        pages['create-folder'],
        pages['create-team'],
        pages['create-user'],
      ],
      '进阶教程': [
        pages['create-variables'],
        pages['create-sidemenu'],
        pages['advance-permissions'],
        pages['alerts'],
      ],
      '插件指南': [
        pages['plugins-overview'],
      ]
    }
  } else {
    nav = {
      'Getting started': [
        pages['installation'],
      ],
    }
  }


  return (
    <>
      <Title suffix={router.pathname === '/' ? undefined : 'Datav'}>
        {props.layoutProps.meta.metaTitle || props.layoutProps.meta.title}
      </Title>
      <Head>
        <meta key="twitter:card" name="twitter:card" content="summary" />
        <meta
          key="twitter:image"
          name="twitter:image"
          content={`https://tailwindcss.com${twitterSquare}`}
        />
      </Head>
      <SidebarLayout nav={nav} {...props} />
    </>
  )
}
