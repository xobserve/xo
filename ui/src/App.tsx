// Copyright 2023 Datav.io Team
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
import BaiduMap from 'components/BaiduMap'
import { requestApi } from 'utils/axios/request'
import { config, UIConfig } from 'src/data/configs/config'
import { Datasource } from 'types/datasource'
import { Variable } from 'types/variable'
import {  setVariableSelected } from './views/variables/SelectVariable'
import AntdWrapper from 'components/AntdWrapper'
import { routes } from './routes';
import { initColors } from 'utils/colors';
import { $variables } from './views/variables/store';


const { ToastContainer } = createStandaloneToast()

export let canvasCtx;
export let datasources: Datasource[] = []
export let gvariables: Variable[] = []


export let appInitialized = false
const AppView = () => {
  const { colorMode } = useColorMode()

  initColors(colorMode)


  const [cfg, setConfig] = useState<UIConfig>(null)
  canvasCtx = document.createElement('canvas').getContext('2d')!;

  useEffect(() => {
    loadConfig()
    loadVariables()
    // we add background color in index.html to make loading screen shows the same color as the app pages
    // but we need to remove it after the App is loaded, otherwise the bg color in index.html will override the bg color in App ,
    // especilally when we changed the color mode, but the bg color will never change
    let bodyStyle = document.body.style
    bodyStyle.background = null
  }, [])

  useEffect(() => {
    if (cfg) {
      const firstPageLoading = document.getElementById('first-page-loading');
      if (firstPageLoading) {
        firstPageLoading.style.display = "none"
      }
    }
  }, [cfg])

  const loadConfig = async () => {
    const res0 = await requestApi.get("/datasource/all")
    datasources = res0.data
    const res = await requestApi.get("/config/ui")
    setConfig(res.data)
    Object.assign(config, res.data)
  }

  const loadVariables = async () => {
    const res = await requestApi.get(`/variable/all`)
    // for (const v of res.data) {
    //   v.values = []
    //   // get the selected value for each variable from localStorage
    // }
    setVariableSelected(res.data)

    // for (const v of res.data) {
    //   if (v.selected == VarialbeAllOption) {
    //     const res1 = await queryVariableValues(v)
    //     v.values = res1.data ?? []
    //   }
    //   // get the selected value for each variable from localStorage
    // }
    gvariables = res.data
    $variables.set(res.data)
  }

  const router = createBrowserRouter(routes);

  return (
    <>
      {cfg && <>
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
