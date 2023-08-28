import Head from 'next/head'

export function Title({ suffix = 'Tailwind CSS', children }) {
  let title = children + (suffix ? ` - ${suffix}` : '')

  return (
    <>
      <Head>
        <title key="title">{title}</title>
      </Head>
      <OgTitle suffix={suffix}>{children}</OgTitle>
    </>
  )
}

export function OgTitle({ suffix = 'Tailwind CSS', children }) {
  let title = children + (suffix ? ` - ${suffix}` : '')

  return (
    <Head>
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="og:title" property="og:title" content={title} />
    </Head>
  )
}

export function Description({ children }) {
  return (
    <>
      <Head>
        <meta name="description" content={children} />
      </Head>
      <OgDescription>{children}</OgDescription>
    </>
  )
}

export function OgDescription({ children }) {
  return (
    <Head>
      <meta key="og:description" property="og:description" content={children} />
      <meta key="twitter:description" name="twitter:description" content={children} />
    </Head>
  )
}
