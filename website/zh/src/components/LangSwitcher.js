export const LangSwitcher = () => {
    return (<span className="cursor-pointer w-12 text-sm font-medium" onClick={() => window.open("https://datav.io" + location.pathname)}>
        <p>EN</p>
    </span>)
}