export const LangSwitcher = () => {  
    return (<span className="cursor-pointer   w-12 text-sm font-medium" onClick={() =>location.href = ("https://zh.datav.io" + location.pathname)}>
        <p>中文</p>
    </span>)
}