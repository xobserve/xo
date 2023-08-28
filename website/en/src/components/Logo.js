import clsx from 'clsx'

export function Logo({ className,showText=true, ...props }) {
  return (
    <div className="w-auto flex" >
      <img src="/logo.png" className="w-8 h-8" />
      {showText && <p className="font-550 ml-2 text-xl sm:text-2xl lg:text-2xl tracking-tight text-center dark:text-white">
        Datav
      </p>}
    </div>
  )
}
