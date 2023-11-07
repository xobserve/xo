// Copyright 2023 xObserve.io Team
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

import { useColorMode } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import React, { useEffect, useState } from 'react'
import { createStandaloneToast } from '@chakra-ui/toast'
import CommonStyles from "src/theme/common.styles"
import BaiduMap from 'src/components/BaiduMap'
import { requestApi } from 'utils/axios/request'
import { $config, UIConfig } from 'src/data/configs/config'
import { initVariableSelected } from './views/variables/SelectVariable'
import AntdWrapper from 'src/components/AntdWrapper'
import { routes } from './routes';
import { initColors } from 'utils/colors';
import {  $teamVariables } from './views/variables/store';
import { $teamDatasources } from './views/datasource/store';
import { concat } from 'lodash';
import { $teams } from './views/team/store';


const { ToastContainer } = createStandaloneToast()

export let canvasCtx;                                                                                                                                                                                                                                                                                                                                                ``


export let appInitialized = false

const AppView = () => {
  const { colorMode } = useColorMode()
  initColors(colorMode)


  const [cfg, setConfig] = useState<UIConfig>($config.get())
  canvasCtx = document.createElement('canvas').getContext('2d')!;

  useEffect(() => {
    const firstPageLoading = document.getElementById('first-page-loading');
    if (firstPageLoading) {
      firstPageLoading.style.display = "none"
    }

    loadConfig()
    // we add background color in index.html to make loading screen shows the same color as the app pages
    // but we need to remove it after the App is loaded, otherwise the bg color in index.html will override the bg color in App ,
    // especilally when we changed the color mode, but the bg color will never change
    let bodyStyle = document.body.style
    bodyStyle.background = null
  }, [])

  useEffect(() => {

  },[])

  const loadConfig = async () => {
    const r0 = requestApi.get(`/datasource/all`)
    const r = requestApi.get("/config/ui")
    const r1 = requestApi.get("teams/all")

    const res1 = await Promise.all([r0, r])

    $teams.set((await r1).data)

    const datasources = {}
    for (const ds of res1[0].data) {
      datasources[ds.teamId] = concat(datasources[ds.teamId]??[], ds)
    }
    $teamDatasources.set(datasources)

    const res = res1[1]
    const cfg = res.data.config
    cfg.sidemenu = cfg.sidemenu.data.filter((item) => !item.hidden)
    setConfig(cfg)
    $config.set(cfg)

    const vars = {}
    for (const v of res.data.vars) {
      vars[v.teamId] = concat(vars[v.teamId]??[], v)
    }
    initVariableSelected(res.data.vars)
    $teamVariables.set(vars)
}


  const router = createBrowserRouter(routes);

  return (
    <>
      {<>
        <AntdWrapper>
          <RouterProvider router={router} />
        </AntdWrapper>
      </>}

      <CommonStyles />
      <ToastContainer />
      {cfg && cfg.panel.echarts.enableBaiduMap && <BaiduMap ak={cfg.panel.echarts.baiduMapAK} />}
    </>
  )
}

export default AppView
