import React, { Suspense} from 'react'
import { Layout, BackTop } from 'antd'
import { Route,Redirect, withRouter} from 'react-router-dom'

import './Content.less'
const { Content } = Layout

function ContentWrapper(porps:any){
    const { routers } = porps
    
    return(
        <>
            <Content className="datav-content">
                <Suspense fallback={<div />}>
                    {
                        routers.map((route, i) => {
                            return(
                                <Route exact={route.exact} key={i.toString()} path={route.url} render={(props) => <route.component key={props.match.params.uid} routeID={route.id} parentRouteID={route.parentID}  {...props}/>} />
                            )
                        })
                    }
                    {/* <Redirect from="/*" to="/dashboard" /> */}
                </Suspense>
                <BackTop />
            </Content>
        </>
    )
}

export default withRouter(ContentWrapper)