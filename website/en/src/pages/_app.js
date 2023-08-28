import '../css/fonts.css'
import '../css/main.css'
import 'focus-visible'
import { useState, useEffect, Fragment } from 'react'
import { Header } from '@/components/Header'
import { Description, OgDescription, OgTitle, Title } from '@/components/Meta'
import Router from 'next/router'
import ProgressBar from '@badrap/bar-of-progress'
import Head from 'next/head'
import { SearchProvider } from '@/components/Search'

const progress = new ProgressBar({
  size: 2,
  color: '#38bdf8',
  className: 'bar-of-progress',
  delay: 100,
})

// this fixes safari jumping to the bottom of the page
// when closing the search modal using the `esc` key
if (typeof window !== 'undefined') {
  progress.start()
  progress.finish()
}

Router.events.on('routeChangeStart', () => progress.start())
Router.events.on('routeChangeComplete', () => progress.finish())
Router.events.on('routeChangeError', () => progress.finish())

export default function App({ Component, pageProps, router }) {
  let [navIsOpen, setNavIsOpen] = useState(false)

  useEffect(() => {
    if (!navIsOpen) return
    function handleRouteChange() {
      setNavIsOpen(false)
    }
    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [navIsOpen])

  const Layout = Component.layoutProps?.Layout || Fragment
  const layoutProps = Component.layoutProps?.Layout
    ? { layoutProps: Component.layoutProps, navIsOpen, setNavIsOpen }
    : {}
  const showHeader = router.pathname !== '/'
  const meta = Component.layoutProps?.meta || {}
  const description =
    meta.metaDescription ||
    meta.description ||
    'Tailwind CSS is a utility-first CSS framework for rapidly building modern websites without ever leaving your HTML.'
  let image = meta.ogImage ?? meta.image
  image = image
    ? `https://tailwindcss.com${image.default?.src ?? image.src ?? image}`
    : `https://tailwindcss.com/api/og?path=${router.pathname}`

  if (router.pathname.startsWith('/examples/')) {
    return <Component {...pageProps} />
  }

  let section =
    meta.section ||
    Object.entries(Component.layoutProps?.Layout?.nav ?? {}).find(([, items]) =>
      items.find(({ href }) => href === router.pathname)
    )?.[0]

  return (
    <>
      <Title>{meta.metaTitle || meta.title}</Title>
      {meta.ogTitle && <OgTitle>{meta.ogTitle}</OgTitle>}
      <Description>{description}</Description>
      {meta.ogDescription && <OgDescription>{meta.ogDescription}</OgDescription>}
      <Head>
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:site" name="twitter:site" content="@tailwindcss" />
        <meta key="twitter:image" name="twitter:image" content={image} />
        <meta key="twitter:creator" name="twitter:creator" content="@tailwindcss" />
        <meta
          key="og:url"
          property="og:url"
          content={`https://tailwindcss.com${router.pathname}`}
        />
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:image" property="og:image" content={image} />
        <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="/feeds/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="Atom 1.0" href="/feeds/atom.xml" />
        <link rel="alternate" type="application/json" title="JSON Feed" href="/feeds/feed.json" />
      </Head>
      <SearchProvider>
        {showHeader && (
          <Header
            hasNav={Boolean(Component.layoutProps?.Layout?.nav)}
            navIsOpen={navIsOpen}
            onNavToggle={(isOpen) => setNavIsOpen(isOpen)}
            title={meta.title}
            section={section}
          />
        )}
        <Layout {...layoutProps}>
          <Component section={section} {...Component.layoutProps} {...pageProps} />
        </Layout>
      </SearchProvider>
    </>
  )
}
