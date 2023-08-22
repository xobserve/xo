import { useEffect, useContext } from 'react'
import { ContentsContext } from '@/layouts/ContentsLayout'
import clsx from 'clsx'

export function Heading({
  level,
  id,
  children,
  className = '',
  hidden = false,
  ignore = false,
  style = {},
  nextElement,
  ...props
}) {
  let Component = `h${level}`
  const context = useContext(ContentsContext)

  useEffect(() => {
    if (!context) return
    context.registerHeading(id)
    return () => {
      context.unregisterHeading(id)
    }
  }, [id, context?.registerHeading, context?.unregisterHeading])

  return (
    <Component
      className={clsx('flex whitespace-pre-wrap not-prose', className, {
        'mb-2 text-sm leading-6 text-sky-500 font-semibold tracking-normal dark:text-sky-400':
          level === 2 && nextElement?.type === 'heading' && nextElement?.depth === 3,
      })}
      id={id}
      style={{ ...(hidden ? { marginBottom: 0 } : {}), ...style }}
      data-docsearch-ignore={ignore ? '' : undefined}
      {...props}
    >
      <a
        className={clsx('group relative border-none', hidden ? 'sr-only' : 'lg:-ml-2 lg:pl-2')}
        href={`#${id}`}
      >
        <div className="absolute -ml-8 hidden items-center border-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 lg:flex">
          &#8203;
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 shadow-sm ring-1 ring-slate-900/5 hover:text-slate-700 hover:shadow hover:ring-slate-900/10 dark:bg-slate-700 dark:text-slate-300 dark:shadow-none dark:ring-0">
            <svg width="12" height="12" fill="none" aria-hidden="true">
              <path
                d="M3.75 1v10M8.25 1v10M1 3.75h10M1 8.25h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        {children}
      </a>
    </Component>
  )
}
