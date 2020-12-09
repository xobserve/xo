import getConfig from 'next/config'
const {appName} = getConfig().publicRuntimeConfig

export function AppName() {
    return (
        <span>{appName}</span>
    )
}