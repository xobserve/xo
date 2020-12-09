import React from 'react'
import { Layout} from 'antd'
import classNames from 'classnames'

import {routers} from 'src/routes'
import {SideMenu} from './SideMenu/SideMenu'
import ContentWrapper from './Content/Content'
import { currentTheme, setCurrentTheme, ThemeType} from 'src/packages/datav-core/src'
import OnRoute from './OnRoute'
import ModalService from 'src/core/services/modal'
import SearchWrapper from 'src/views/search/components/SearchWrapper'
import './Layouts.less'
import { getUrlParams } from 'src/core/library/utils/url'
import { store } from 'src/store/store'
import { updateTheme } from 'src/store/reducers/application'


const Layouts = () => {
  const appClasses = classNames({
    'datav-layouts' : true,
    'datav-layouts-dark': currentTheme === ThemeType.Dark,
    'datav-layouts-light': currentTheme === ThemeType.Light
  })

  // init theme from url 
  const theme = getUrlParams()['theme']
  if (theme === ThemeType.Light || theme === ThemeType.Dark) {
    store.dispatch(updateTheme(theme))
    setCurrentTheme(theme)
  }

  return (
    <Layout className={appClasses}>
      <SideMenu  />
      <Layout className="datav-layout">
        <ContentWrapper routers={routers} />
      </Layout>

      <ModalService />
      <OnRoute />
      <SearchWrapper />
    </Layout> 
  )
}

export default Layouts