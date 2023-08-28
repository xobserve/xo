import clsx from 'clsx'
import Link from 'next/link'

/**
 * @param {object} param0
 * @param {{name: string, href: string, steps: any[]}[]} param0.tabs
 * @param {number} param0.selectedTabIndex
 * @returns {JSX.Element}
 */
export function TabBar({ tabs, selectedTabIndex }) {
  return (
    <div className="flex overflow-auto mb-6 -mx-4 sm:-mx-6">
      <div className="flex-none min-w-full px-4 sm:px-6">
        <ul className="border-b border-slate-200 space-x-6 flex whitespace-nowrap dark:border-slate-200/5 mb-px">
          {tabs.map((tab, tabIndex) => (
            <li key={tab.key || tab.name}>
              <h2>
                <Link
                  href={tab.href}
                  scroll={false}
                  className={clsx(
                    'flex text-sm leading-6 font-semibold pt-3 pb-2.5 border-b-2 -mb-px',
                    tabIndex === selectedTabIndex
                      ? 'text-sky-500 border-current [&_code]:bg-sky-50'
                      : 'text-slate-900 border-transparent hover:border-slate-300 dark:text-slate-200 dark:hover:border-slate-700 [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800'
                  )}
                >
                  {tab.name}
                </Link>
              </h2>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
