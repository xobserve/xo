// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import { Modal,notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons'
import Login from '../Login/Login'


import './App.less';

import Layouts from 'src/views/Layouts/Layouts'


import Intl from './Intl'
import ConfigProvider from './ConfigProvider'

import darkVars from 'src/styles/dark.json';
import lightVars from 'src/styles/light.json';
import { StoreState } from 'src/types'

import { LocationUpdate, setDataSourceService, setBackendSrv, ThemeType, setCurrentTheme, setMarkdownOptions, getBackendSrv, setBootConfig, ThemeContext, getTheme, setLocationSrv,standardFieldConfigEditorRegistry, getStandardFieldConfigs,standardTransformersRegistry, currentLang} from 'src/packages/datav-core'
import { DatasourceSrv } from 'src/core/services/datasource'
import { backendSrv } from 'src/core/services/backend'

import { TimeSrv, setTimeSrv } from 'src/core/services/time';
import { KeybindingSrv, setKeybindingSrv } from 'src/core/services/keybinding'
import { store } from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';
import { setContextSrv } from 'src/core/services/context';
import { standardEditorsRegistry, getStandardOptionEditors } from 'src/packages/datav-core/src';
import globalEvents from './globalEvents'
import { getDefaultVariableAdapters, variableAdapters } from 'src/views/variables/adapters';
import { initRoutes } from 'src/routes';
import { setLinkSrv, LinkSrv } from 'src/core/services/link';
import { getStandardTransformers } from 'src/core/library/utils/standardTransformers';
import { getUrlParams } from 'src/core/library/utils/url'
import localeData from 'src/core/library/locale';

interface Props {
  theme: string 
}

const UIApp = (props: Props) => {
  const [canRender, setCanRender] = useState(false)
  const { theme } = props
  setCurrentTheme(theme as ThemeType)

  useEffect(() => {
    let vars = theme === ThemeType.Light ? lightVars : darkVars;
    const newVars = { ...vars, "a": "b" }
    window.less.modifyVars(newVars)
  }, [theme])

  // only call in initial phase
  useEffect(() => {
    initAll()
  }, [])





  const initAll = async () => {
    // init backend service
    initBackendService()

    // init time service
    initTimeService()

        
    // set sidemenu
    const params = getUrlParams()
    const teamId = params['sidemenu']
    if (teamId) {
      try {
        // check user can use this sidemenu
        const res = await getBackendSrv().get(`/api/users/user/sidemenu/${teamId}`)
        // set menu for user in backend
        await getBackendSrv().put("/api/users/user/sidemenu", {menuId: res.data})
      } catch (error) {
        notification['error']({
          message: "Error",
          description: localeData[currentLang][error.data.message],
          duration: 5
        });
      }
    }
    
    // load boot config
    const res = await getBackendSrv().get('/api/bootConfig');
    setBootConfig(res.data)

    variableAdapters.setInit(getDefaultVariableAdapters);

    globalEvents.init()

    standardEditorsRegistry.setInit(getStandardOptionEditors);
    standardFieldConfigEditorRegistry.setInit(getStandardFieldConfigs)
    standardTransformersRegistry.setInit(getStandardTransformers)
    // init menu items
    initRoutes(store)

    // init datasource service
    initDatasourceService()

    // init keybinding service
    initKeybindingService()

    // init link service
    const linkSrv = new LinkSrv()
    setLinkSrv(linkSrv)

    // set markdown options
    setMarkdownOptions({ sanitize: true })


    // init location service
    setLocationSrv({
      update: (opt: LocationUpdate) => {
        store.dispatch(updateLocation(opt));
      },
    });

    // init context service
    setContextSrv(store.getState().user.id, store.getState().user.role)

    // init location service
    setLocationSrv({
      update: (opt: LocationUpdate) => {
        store.dispatch(updateLocation(opt));
      },
    });

    setCanRender(true)
  }

  const customConfirm = (message, callback) => {
    Modal.confirm({
      title: message,
      icon: <ExclamationCircleOutlined />,
      onCancel: () => {
        callback(false);
      },
      onOk: () => {
        callback(true);
      }
    })
  }

  const render =
    canRender
      ?
      <ThemeContext.Provider value={getTheme(props.theme)}>
        <Intl >
          <ConfigProvider>
            <Router getUserConfirmation={customConfirm}>
              <Switch>
                <Route path="/login" exact component={Login} />
                <Route path="/" component={Layouts} />
              </Switch>
            </Router>
          </ConfigProvider>
        </Intl>
      </ThemeContext.Provider>
      :
      <></>
  return render
}


function initDatasourceService() {
  const ds = new DatasourceSrv()
  setDataSourceService(ds);
}


function initBackendService() {
  setBackendSrv(backendSrv)
}


function initTimeService() {
  const ds = new TimeSrv()
  setTimeSrv(ds);
}

function initKeybindingService() {
  const kb = new KeybindingSrv()
  setKeybindingSrv(kb)
}

export const mapStateToProps = (state: StoreState) => ({
  theme: state.application.theme
});

export default connect(mapStateToProps)(UIApp);