import { useEffect, useState } from 'react'
import colorPalette from 'tailwindcss/colors'
import { kebabToTitleCase } from '@/utils/kebabToTitleCase'
import dlv from 'dlv'
import { Transition } from '@headlessui/react'

export function ColorPaletteReference({ colors }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-2 gap-y-8 sm:grid-cols-1">
      {colors.map((color, i) => {
        let title = Array.isArray(color) ? color[0] : kebabToTitleCase(color)
        let value = Array.isArray(color) ? color[1] : color

        let palette =
          typeof value === 'string'
            ? [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((variant) => ({
                name: variant,
                value: dlv(colorPalette, [value, variant]),
              }))
            : Object.keys(value).map((name) => ({ name, value: value[name] }))

        return (
          <div key={title} className="2xl:contents">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 2xl:col-end-1 2xl:pt-2.5">
              {title
                .split('')
                .flatMap((l, i) => {
                  return i !== 0 && l.toUpperCase() === l ? [' ', l] : [l]
                })
                .join('')}
            </div>
            <div className="grid mt-3 grid-cols-1 sm:grid-cols-11 gap-y-3 gap-x-2 sm:mt-2 2xl:mt-0">
              {palette.map((props, j) => (
                <ColorPalette key={j} {...props} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ColorPalette({ name, value }) {
  const [{ state }, setState] = useState({ state: 'idle' })

  useEffect(() => {
    if (state === 'copied') {
      const handle = window.setTimeout(() => {
        setState({ state: 'idle' })
      }, 1500)
      return () => {
        window.clearTimeout(handle)
      }
    }
  }, [state])

  return (
    <div className="relative flex">
      <div
        className="flex items-center gap-x-3 w-full cursor-pointer sm:block sm:space-y-1.5"
        onClick={() =>
          navigator.clipboard.writeText(value).then(() => {
            setState({ state: 'copied' })
          })
        }
      >
        <div
          className="h-10 w-10 rounded dark:ring-1 dark:ring-inset dark:ring-white/10 sm:w-full"
          style={{ backgroundColor: value }}
        />
        <div className="px-0.5">
          <div className="w-6 font-medium text-xs text-slate-900 2xl:w-full dark:text-white">
            {name}
          </div>
          <div className="text-slate-500 text-xs font-mono lowercase dark:text-slate-400 sm:text-[0.625rem] md:text-xs lg:text-[0.625rem] 2xl:text-xs">
            {value}
          </div>
        </div>
      </div>
      <Transition
        className="absolute bottom-full left-1/2 mb-3.5 pb-1 -translate-x-1/2"
        show={state === 'copied'}
        enter="transform ease-out duration-200 transition origin-bottom"
        enterFrom="scale-95 translate-y-0.5 opacity-0"
        enterTo="scale-100 translate-y-0 opacity-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="relative bg-sky-500 text-white font-mono text-[0.625rem] leading-6 font-medium px-1.5 rounded-lg">
          Copied
          <svg
            aria-hidden="true"
            width="16"
            height="6"
            viewBox="0 0 16 6"
            className="text-sky-500 absolute top-full left-1/2 -mt-px -ml-2"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </Transition>
    </div>
  )
}
