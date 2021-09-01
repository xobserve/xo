import React from 'react'
import { useLocation } from 'react-router-dom'
import { css } from 'emotion';

import {routers} from 'src/routes'
import { Icon } from 'src/packages/datav-core/src/ui'
import { DashboardModel } from 'src/views/dashboard/model'
import { updateLocation } from 'src/store/reducers/location';
import { store } from 'src/store/store';
interface Props  {
    dashboard: DashboardModel
    isFullscreen: boolean
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

    let icon:string
    if (!route) {
        icon = 'apps'
    } else {
        icon = route.icon
    }
    
    const onFolderNameClick = () => {
        store.dispatch(updateLocation({ 
            query: { search: 'open'},
            partial: true
        }));
    }
     
    const onDashboardNameClick = () => {
        store.dispatch(updateLocation({
            query: { search: 'open' ,folder:'current'},
            partial: true,
          }));
    }
    const renderDashboardTitleSearchButton= () => {
        const { dashboard, isFullscreen } = props;
    
        const folderSymbol = css`
          margin-right: 0 4px;
        `;
        const mainIconClassName = css`
          margin-right: 8px;
          margin-bottom: 3px;
        `;
    
        const folderTitle = dashboard.meta.folderTitle;
        const haveFolder = dashboard.id &&  dashboard.meta.folderId > 0;
        return (
          <>
            <div>
              <div className="navbar-page-btn">
                {/* {!isFullscreen && <Icon name={icon} size="lg" className={mainIconClassName} />} */}
                {haveFolder && (
                  <>
                    <a className="navbar-page-btn__folder hover-primary" onClick={onFolderNameClick}>
                      {folderTitle} <span className={folderSymbol}>/</span>
                    </a>
                  </>
                )}
                <a onClick={onDashboardNameClick} className="hover-primary">{dashboard.title}</a>
              </div>
            </div>
            <div className="navbar__spacer" />
          </>
        );
      }

    return (
        <>
            {renderDashboardTitleSearchButton()}
            {/* <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item key={route?.url}>{<Icon name={icon} size="lg" />} {text}</Breadcrumb.Item>
                </Breadcrumb>
            </div> */}
        </>
    )
}

export default BreadcrumbWrapper