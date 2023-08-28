import clsx from 'clsx'
import { TabBar } from '@/components/TabBar'

const frameColors = {
  sky: 'from-sky-500 to-cyan-300',
  indigo: 'from-indigo-500 to-blue-400',
  pink: 'from-pink-500 to-fuchsia-400',
  fuchsia: 'from-fuchsia-500 to-purple-400',
  purple: 'from-violet-500 to-purple-500',
}

export function Frame({ className, color = 'sky', children }) {
  return (
    <div
      className={clsx(
        className,
        frameColors[color],
        'relative -mx-4 pt-6 pl-4 bg-gradient-to-b sm:mx-0 sm:rounded-2xl sm:pt-12 sm:pl-12'
      )}
    >
      <div className="rounded-tl-xl overflow-hidden sm:rounded-br-xl">{children}</div>
    </div>
  )
}

export function EditorPane({ filename, scroll = false, code, children }) {
  return (
    <div className="pt-2 bg-slate-800 shadow-lg group">
      <TabBar primary={{ name: filename }} showTabMarkers={false} />
      <div
        className={clsx(
          'children:my-0 children:!shadow-none children:bg-transparent',
          scroll &&
            clsx(
              'overflow-y-auto max-h-96',
              'scrollbar:w-4 scrollbar:h-4 scrollbar:transparent',
              'scrollbar-thumb:border-4 scrollbar-thumb:border-solid scrollbar-thumb:border-slate-800 scrollbar-thumb:bg-slate-500/50 group-hover:scrollbar-thumb:bg-slate-500/60 scrollbar-thumb:rounded-full',
              'scrollbar-track:rounded'
            )
        )}
        {...(code ? { dangerouslySetInnerHTML: { __html: code } } : { children })}
      />
    </div>
  )
}

export function Editor({ filename, scroll = false, style = 'plain', color, children, code }) {
  let passthrough = { scroll }

  if (style === 'framed') {
    return (
      <Frame className="mt-5 mb-8 first:mt-0 last:mb-0" color={color}>
        <EditorPane {...passthrough} filename={filename} code={code} children={children} />
      </Frame>
    )
  }

  return (
    <div className="mt-5 mb-8 first:mt-0 last:mb-0 relative overflow-hidden rounded-2xl">
      <EditorPane {...passthrough} filename={filename} code={code} children={children} />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl dark:ring-1 dark:ring-white/10 dark:ring-inset"
        aria-hidden="true"
      />
    </div>
  )
}
