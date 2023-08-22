import { MDXProvider } from '@mdx-js/react'
import { showcase } from '@/showcase'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { Children, cloneElement } from 'react'
import { Footer } from '@/components/Footer'
import { Description, Title, OgDescription, OgTitle } from '@/components/Meta'

function Caption({ children }) {
  return (
    <figcaption className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-0 2xl:max-w-8xl">
      <div className="-ml-px pt-4 pl-4 sm:pt-6 sm:pl-6 border-l border-slate-200 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-400">
        {children}
      </div>
    </figcaption>
  )
}

function ShowcaseImage({ src, darkSrc, caption, isMobile = false, margin = true, ...props }) {
  if (isMobile) {
    return (
      <div className="bg-slate-200 rounded-lg ring-1 ring-slate-900/5 overflow-hidden shadow-md shadow-slate-700/5">
        <Image
          src={src}
          alt=""
          quality={90}
          className={clsx(darkSrc && 'dark:hidden')}
          {...props}
        />
        {darkSrc && (
          <Image src={darkSrc} alt="" quality={90} className="hidden dark:block" {...props} />
        )}
      </div>
    )
  }

  return (
    <figure className={clsx('relative z-20', margin && 'my-20 sm:my-32')}>
      <div className="relative bg-slate-100 overflow-hidden dark:bg-slate-800">
        <div className="absolute inset-x-0 top-0 bg-slate-900/5 h-px dark:bg-slate-100/5" />
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/5 h-px dark:bg-slate-100/5" />
        <div className="max-w-8xl mx-auto">
          <div className="ring-1 ring-slate-900/5 shadow-md shadow-slate-900/10 bg-slate-200">
            <Image
              src={src}
              alt=""
              sizes="(min-width: 1440px) 1440px, 100vw"
              quality={90}
              className={clsx(darkSrc && 'dark:hidden')}
              {...props}
            />
            {darkSrc && (
              <Image
                src={darkSrc}
                alt=""
                sizes="(min-width: 1440px) 1440px, 100vw"
                quality={90}
                className="hidden dark:block"
                {...props}
              />
            )}
          </div>
        </div>
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

function ShowcaseMobileImages({ children, caption }) {
  let childCount = Children.count(children)

  return (
    <figure className="my-20 md:my-32">
      <div className="relative bg-slate-100 dark:bg-slate-800 py-20 sm:py-32 sm:overflow-x-auto sm:flex">
        <div className="absolute inset-x-0 top-0 bg-slate-900/5 h-px dark:bg-slate-100/5" />
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/5 h-px dark:bg-slate-100/5" />
        <div
          className={clsx(
            'flex flex-col sm:flex-row items-center sm:flex-none min-w-full sm:px-6 lg:px-8 gap-y-16',
            childCount === 2 ? 'gap-x-10 lg:gap-x-32' : 'gap-x-10'
          )}
        >
          {Children.map(children, (child, childIndex) => (
            <div
              className={clsx(
                'flex-none w-[23.625rem] max-w-full',
                childIndex === 0 && 'sm:ml-auto',
                childIndex === childCount - 1 && 'sm:mr-auto'
              )}
            >
              {cloneElement(child, { isMobile: true })}
            </div>
          ))}
        </div>
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

function ShowcaseIntro({ eyebrow, title, children }) {
  return (
    <div className="max-w-8xl mx-auto pt-14 sm:pt-20 md:pt-32 xl:pt-36 mb-20 md:mb-32 px-4 sm:px-6 lg:px-8">
      <p className="text-sm leading-6 font-semibold text-sky-500">{eyebrow}</p>
      {title && (
        <h2 className="mt-4 max-w-5xl text-slate-900 text-3xl sm:text-6xl tracking-tight font-bold dark:text-white">
          {title}
        </h2>
      )}
      <div className="mt-4 max-w-3xl prose prose-slate dark:prose-dark">{children}</div>
    </div>
  )
}

export function ShowcaseLayout({ children, slug, meta }) {
  let siteIndex = showcase.findIndex((site) => site.slug === slug)
  let previousSite = showcase[siteIndex - 1]
  let nextSite = showcase[siteIndex + 1]

  return (
    <>
      <Title>{`Showcase Example: ${meta.title}`}</Title>
      <OgTitle>{`Showcase Example: ${meta.title}`}</OgTitle>
      <Description>
        {meta.description ??
          "See how companies, from small startups to some of the world's largest brands, use Tailwind CSS to build unique websites and products."}
      </Description>
      {meta.ogDescription && <OgDescription>{meta.ogDescription}</OgDescription>}
      <article>
        <header className="bg-white/95 z-40 supports-backdrop-blur:bg-white/60 backdrop-blur py-4 relative shadow-md shadow-slate-700/5 dark:bg-transparent">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 grid items-center grid-cols-[1fr,auto,1fr] gap-6">
            <div className="text-center">
              <p className="text-[0.8125rem] leading-6 font-semibold text-sky-500">
                <Link href="/showcase">Showcase</Link>
              </p>
              <h1 className="mt-1 text-xl leading-8 tracking-tight font-semibold text-slate-900 dark:text-white">
                {meta.title}
              </h1>
            </div>
            <div className="order-first flex">
              {previousSite && (
                <Link
                  href={`/showcase/${previousSite.slug}`}
                  aria-label={`Previous site: ${previousSite.name}`}
                  className="relative"
                >
                  <div className="hidden md:block text-[0.8125rem] leading-6 text-slate-500">
                    <span aria-hidden="true">&larr; </span>
                    Previous
                  </div>
                  <div className="hidden md:block mt-2 text-sm leading-6 font-semibold text-slate-900 dark:text-white">
                    {previousSite.name}
                  </div>
                  <div className="absolute -inset-1 md:hidden" />
                  <svg
                    className="md:hidden w-6 h-6 stroke-slate-900 dark:stroke-white"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.25 8.75 9.75 12l3.5 3.25"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              )}
            </div>
            <div className="flex text-right justify-end">
              {nextSite && (
                <Link
                  href={`/showcase/${nextSite.slug}`}
                  aria-label={`Next site: ${nextSite.name}`}
                  className="relative"
                >
                  <div className="hidden md:block text-[0.8125rem] leading-6 text-slate-500">
                    Next
                    <span aria-hidden="true"> &rarr;</span>
                  </div>
                  <div className="hidden md:block mt-2 text-sm leading-6 font-semibold text-slate-900 dark:text-white">
                    {nextSite.name}
                  </div>
                  <div className="absolute -inset-1 md:hidden" />
                  <svg
                    className="md:hidden w-6 h-6 stroke-slate-900 dark:stroke-white"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m10.75 8.75 3.5 3.25-3.5 3.25"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </header>
        {meta.image && (
          <ShowcaseImage
            src={meta.image}
            darkSrc={meta.dark?.image}
            alt={meta.imageAlt ?? ''}
            margin={false}
            priority
          />
        )}
        <div className="overflow-hidden">
          <div className="relative max-w-8xl py-6 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <Image
              src={require('@/img/showcase/beams-2@75.jpg')}
              alt=""
              className="absolute top-[-20rem] sm:top-[-25rem] left-1/2 ml-[-35rem] max-w-none w-[119.4375rem] dark:hidden pointer-events-none"
              unoptimized
            />
            <Image
              src={require('@/img/showcase/beams-2-dark@75.jpg')}
              alt=""
              className="absolute top-0 right-[-12rem] md:right-0 max-w-none w-[70.0625rem] hidden dark:block pointer-events-none"
              unoptimized
            />
            <dl className="relative flex flex-wrap h-14 overflow-hidden">
              {[
                ...(meta.tech ? [{ name: 'Technologies', value: meta.tech }] : []),
                {
                  name: 'Date',
                  value: (
                    <time dateTime={meta.date}>
                      {new Date(meta.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </time>
                  ),
                },
                {
                  name: 'URL',
                  value: (
                    <Link href={meta.url}>
                      {meta.url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
                    </Link>
                  ),
                },
              ].map((item, itemIndex) => (
                <div
                  key={item.name}
                  className={clsx(
                    itemIndex > 0 &&
                      'border-l border-slate-500/10 dark:border-slate-400/10 ml-6 pl-6 lg:ml-8 lg:pl-8'
                  )}
                >
                  <dt className="text-[0.8125rem] leading-6 font-semibold text-slate-700 dark:text-slate-400">
                    {item.name}
                  </dt>
                  <dd className="text-sm leading-6 mt-2 text-slate-700 dark:text-slate-200">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              href={meta.url}
              aria-label={`Visit ${meta.title}`}
              className="relative flex-none text-sm text-center font-semibold text-white py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-sky-500 dark:text-white focus:outline-none hover:bg-slate-700 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:highlight-white/20 dark:hover:bg-sky-400 dark:focus:ring-2 dark:focus:ring-sky-600 dark:focus:ring-offset-slate-900"
            >
              Go to website <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <MDXProvider
            components={{
              Intro: (props) => <ShowcaseIntro eyebrow={meta.title} {...props} />,
              Image: ShowcaseImage,
              Mobile: ShowcaseMobileImages,
            }}
          >
            <div className="relative [&>:first-child]:!mt-0 [&>:last-child]:!mb-0">{children}</div>
          </MDXProvider>
        </div>
      </article>
      <footer className="pt-20 sm:pt-32 text-center pb-16">
        <Footer.Content />
      </footer>
    </>
  )
}
