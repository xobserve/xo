import React from 'react'
import { useLocation } from 'react-router-dom'
import { Breadcrumb } from 'antd'
// import { FormattedMessage as Message } from 'react-intl' 
import {routers} from 'src/routes'
import { Icon } from 'src/packages/datav-core/src'
interface Props  {
    text?: string
}
const BreadcrumbWrapper = (props:Props) =>{
    let location = useLocation()
    // find the route name by pathname
    // eslint-disable-next-line 
    const route = routers.find((r) => {
        if (r.url === location.pathname) {
            return r
        }
    })

    let text:string
    let icon:string
    if (!route) {
        text = props.text
        icon = 'apps'
    } else {
        text = route.title
        icon = route.icon
    }
    

    return (
        <>
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item key={route?.url}>{<Icon name={icon} size="lg" />} {text}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
        </>
    )
}

export default BreadcrumbWrapper