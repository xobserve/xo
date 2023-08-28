import { Widont } from '@/components/home/common'
import { NewsletterForm } from '@/components/NewsletterForm'
import { formatDate } from '@/utils/formatDate'
import { mdxComponents } from '@/utils/mdxComponents'
import { MDXProvider } from '@mdx-js/react'
import clsx from 'clsx'
import Link from 'next/link'

export function BlogPostLayout({ children, meta }) {
  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto">
        <div className="flex px-4 pt-8 pb-10 lg:px-8">
          <Link
            href="/blog"
            className="group flex font-semibold text-sm leading-6 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            <svg
              viewBox="0 -9 3 24"
              className="overflow-visible mr-3 text-slate-400 w-auto h-6 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            >
              <path
                d="M3 0L0 3L3 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Go back
          </Link>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <main>
            <article className="relative pt-10">
              <h1
                className={clsx(
                  'text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200 md:text-3xl '
                )}
              >
                <Widont>{meta.title}</Widont>
              </h1>
              <div className="text-sm leading-6">
                <dl>
                  <dt className="sr-only">Date</dt>
                  <dd
                    className={clsx('absolute top-0 inset-x-0 text-slate-700 dark:text-slate-400')}
                  >
                    <time dateTime={meta.date}>
                      {formatDate(meta.date, '{dddd}, {MMMM} {DD}, {YYYY}')}
                    </time>
                  </dd>
                </dl>
              </div>
              <div className="mt-6">
                <ul className={clsx('flex flex-wrap text-sm leading-6 -mt-6 -mx-5')}>
                  {meta.authors.map((author) => (
                    <li
                      key={author.twitter}
                      className="flex items-center font-medium whitespace-nowrap px-5 mt-6"
                    >
                      <img
                        src={author.avatar}
                        alt=""
                        className="mr-3 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800"
                        decoding="async"
                      />
                      <div className="text-sm leading-4">
                        <div className="text-slate-900 dark:text-slate-200">{author.name}</div>
                        <div className="mt-1">
                          <a
                            href={`https://twitter.com/${author.twitter}`}
                            className="text-sky-500 hover:text-sky-600 dark:text-sky-400"
                          >
                            @{author.twitter}
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={clsx('mt-12 prose prose-slate dark:prose-dark')}>
                <MDXProvider components={mdxComponents}>{children}</MDXProvider>
              </div>
            </article>
          </main>
          <footer className="mt-16">
            <div className="relative pb-28">
              <div className="absolute inset-0 w-full dark:w-screen overflow-hidden">
                <img
                  src={require('@/img/beams/blog-post-form@80.jpg').default.src}
                  alt=""
                  className="absolute top-px sm:left-auto sm:right-0 left-1/4 dark:hidden max-w-none"
                  width="476"
                  decoding="async"
                />
                <img
                  src={require('@/img/beams/blog-post-form-dark@90.jpg').default.src}
                  alt=""
                  className="absolute top-px -left-1/4 sm:left-0 hidden dark:block max-w-none"
                  width="1429"
                  decoding="async"
                />
              </div>
              <section className="relative py-16 border-t border-slate-200 dark:border-slate-200/5">
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight dark:text-white">
                  Get all of our updates directly to your&nbsp;inbox.
                  <br />
                  Sign up for our newsletter.
                </h2>
                <div className="mt-5 max-w-md">
                  <NewsletterForm action="https://app.convertkit.com/forms/3181881/subscriptions" />
                </div>
              </section>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
