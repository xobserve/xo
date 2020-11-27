import { useIsHome } from '@/hooks/useIsHome'
import Link from 'next/link'
import { VersionSwitcher } from '@/components/VersionSwitcher'
import { Search } from '@/components/Search'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { useRouter } from 'next/router'

const WorkflowAnimation = dynamic(() =>
  import('@/components/WorkflowAnimation').then((mod) => mod.WorkflowAnimation)
)

export function Header({ navIsOpen, onNavToggle }) {
  let isHome = useIsHome()

  if (isHome) {
    return (
      <div id="header">
        <div className="bg-gray-100 pt-24 lg:pt-0">
          <div className="fixed z-100 bg-gray-100 inset-x-0 top-0 border-b-2 border-gray-200 lg:border-b-0 lg:static flex items-center">
            <div className="w-full max-w-screen-xl relative mx-auto px-6">
              <div className="lg:border-b-2 lg:border-gray-200 h-24 flex flex-col justify-center">
                <HeaderInner navIsOpen={navIsOpen} onNavToggle={onNavToggle} />
              </div>
            </div>
          </div>
          <div className="w-full max-w-screen-xl relative mx-auto px-6 pt-16 pb-40 md:pb-24">
            <div className="xl:flex -mx-6">
              <div className="px-6 text-left md:text-center xl:text-left max-w-2xl md:max-w-3xl mx-auto">
                <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl xl:text-4xl font-medium leading-tight">
                  A utility-first CSS framework for{' '}
                  <span className="sm:block text-teal-500 font-medium">
                    rapidly building custom designs.
                  </span>
                </h1>
                <p className="mt-6 leading-relaxed sm:text-lg md:text-xl xl:text-lg text-gray-600">
                  Tailwind CSS is a highly customizable, low-level CSS framework that gives you all
                  of the building blocks you need to build bespoke designs without any annoying
                  opinionated styles you have to fight to override.
                </p>
                <div className="flex mt-6 justify-start md:justify-center xl:justify-start">
                  <Link href="/docs/installation">
                    <a className="rounded-lg px-4 md:px-5 xl:px-4 py-3 md:py-4 xl:py-3 bg-teal-500 hover:bg-teal-600 md:text-lg xl:text-base text-white font-semibold leading-tight shadow-md">
                      Get Started
                    </a>
                  </Link>
                  <a
                    href="#what-is-tailwind"
                    className="ml-4 rounded-lg px-4 md:px-5 xl:px-4 py-3 md:py-4 xl:py-3 bg-white hover:bg-gray-200 md:text-lg xl:text-base text-gray-800 font-semibold leading-tight shadow-md"
                  >
                    Why Tailwind?
                  </a>
                </div>
              </div>
              <div className="mt-12 xl:mt-0 px-6 flex-shrink-0 hidden md:block">
                <div className="mx-auto" style={{ width: '40rem', height: '30rem' }}>
                  <div className="flex flex-col p-2">
                    <WorkflowAnimation />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="bg-wave bg-center bg-repeat-x -mb-8 md:hidden"
          style={{
            height: `${190 * 0.75}px`,
            marginTop: `-${190 * 0.75}px`,
            backgroundSize: `${1440 * 0.75}px ${190 * 0.75}px`,
          }}
        />
        <div
          className="bg-wave bg-center bg-repeat-x -mb-8 hidden md:block"
          style={{
            height: '190px',
            marginTop: '-190px',
            backgroundSize: '1440px 190px',
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div id="header">
        <div className="flex bg-white border-b border-gray-200 fixed top-0 inset-x-0 z-100 h-16 items-center">
          <div className="w-full max-w-screen-xl relative mx-auto px-6">
            <HeaderInner navIsOpen={navIsOpen} onNavToggle={onNavToggle} />
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderInner({ navIsOpen, onNavToggle }) {
  let isHome = useIsHome()
  let router = useRouter()

  return (
    <div className="flex items-center -mx-6">
      <div className="lg:w-1/4 xl:w-1/5 pl-6 pr-6 lg:pr-8">
        <div className="flex items-center">
            <a
              className="block lg:mr-4"
              onContextMenu={(e) => {
                e.preventDefault()
                router.push('/brand')
              }}
            >
               <h1 className="text-gray-600" style={{fontSize: '24px',fontWeight: 450}}>DATAV</h1>
            </a>
        </div>
      </div>
      <div className="flex flex-grow min-w-0 lg:w-3/4 xl:w-4/5">
        <div className="w-full min-w-0 lg:px-6 xl:w-3/4 xl:px-12">
          <Search />
        </div>
        <button
          type="button"
          id="sidebar-open"
          className={clsx(
            'flex px-6 items-center lg:hidden text-gray-500 focus:outline-none focus:text-gray-700',
            {
              hidden: navIsOpen,
            }
          )}
          onClick={() => onNavToggle(true)}
          aria-label="Open site navigation"
        >
          <svg
            className="fill-current w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
        <button
          type="button"
          id="sidebar-close"
          className={clsx(
            'flex px-6 items-center lg:hidden text-gray-500 focus:outline-none focus:text-gray-700',
            {
              hidden: !navIsOpen,
            }
          )}
          onClick={() => onNavToggle(false)}
          aria-label="Close site navigation"
        >
          <svg
            className="fill-current w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
          </svg>
        </button>
        <div className="hidden lg:flex lg:items-center lg:justify-between xl:w-1/4 px-6">
          {/* <div className="relative mr-4">
            <VersionSwitcher />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div> */}
          <div className="flex justify-start items-center text-gray-500">
            {/* <a
              className="block flex items-center hover:text-gray-700 mr-5"
              href="https://github.com/tailwindlabs/tailwindcss"
            >
              <svg
                className="fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>GitHub</title>
                <path d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0" />
              </svg>
            </a>
            <a
              className="block flex items-center hover:text-gray-700 mr-5"
              href="https://twitter.com/tailwindcss"
            >
              <svg
                className="fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Twitter</title>
                <path d="M6.29 18.25c7.55 0 11.67-6.25 11.67-11.67v-.53c.8-.59 1.49-1.3 2.04-2.13-.75.33-1.54.55-2.36.65a4.12 4.12 0 0 0 1.8-2.27c-.8.48-1.68.81-2.6 1a4.1 4.1 0 0 0-7 3.74 11.65 11.65 0 0 1-8.45-4.3 4.1 4.1 0 0 0 1.27 5.49C2.01 8.2 1.37 8.03.8 7.7v.05a4.1 4.1 0 0 0 3.3 4.03 4.1 4.1 0 0 1-1.86.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 0 16.4a11.62 11.62 0 0 0 6.29 1.84" />
              </svg>
            </a>
            <a className="block flex items-center hover:text-gray-700" href="/discord">
              <svg
                className="fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 146 146"
              >
                <title>Discord</title>
                <path
                  d="M107.75 125.001s-4.5-5.375-8.25-10.125c16.375-4.625 22.625-14.875 22.625-14.875-5.125 3.375-10 5.75-14.375 7.375-6.25 2.625-12.25 4.375-18.125 5.375-12 2.25-23 1.625-32.375-.125-7.125-1.375-13.25-3.375-18.375-5.375-2.875-1.125-6-2.5-9.125-4.25-.375-.25-.75-.375-1.125-.625-.25-.125-.375-.25-.5-.375-2.25-1.25-3.5-2.125-3.5-2.125s6 10 21.875 14.75c-3.75 4.75-8.375 10.375-8.375 10.375-27.625-.875-38.125-19-38.125-19 0-40.25 18-72.875 18-72.875 18-13.5 35.125-13.125 35.125-13.125l1.25 1.5c-22.5 6.5-32.875 16.375-32.875 16.375s2.75-1.5 7.375-3.625c13.375-5.875 24-7.5 28.375-7.875.75-.125 1.375-.25 2.125-.25 7.625-1 16.25-1.25 25.25-.25 11.875 1.375 24.625 4.875 37.625 12 0 0-9.875-9.375-31.125-15.875l1.75-2S110 19.626 128 33.126c0 0 18 32.625 18 72.875 0 0-10.625 18.125-38.25 19zM49.625 66.626c-7.125 0-12.75 6.25-12.75 13.875s5.75 13.875 12.75 13.875c7.125 0 12.75-6.25 12.75-13.875.125-7.625-5.625-13.875-12.75-13.875zm45.625 0c-7.125 0-12.75 6.25-12.75 13.875s5.75 13.875 12.75 13.875c7.125 0 12.75-6.25 12.75-13.875s-5.625-13.875-12.75-13.875z"
                  fillRule="nonzero"
                />
              </svg>
            </a> */}
          </div>
        </div>
      </div>
    </div>
  )
}
