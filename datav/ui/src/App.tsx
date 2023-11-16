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

import { useColorMode, useToast } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import React, { useEffect, useMemo, useState } from 'react'
import { createStandaloneToast } from '@chakra-ui/toast'
import CommonStyles from "src/theme/common.styles"
import BaiduMap from 'src/components/BaiduMap'
import { requestApi } from 'utils/axios/request'
import { $config, UIConfig } from 'src/data/configs/config'
import { initVariableSelected } from './views/variables/SelectVariable'
import AntdWrapper from 'src/components/AntdWrapper'
import { getRoutes } from './routes';
import { initColors } from 'utils/colors';
import { $variables } from './views/variables/store';
import { $datasources } from './views/datasource/store';
import { $teams } from './views/team/store';
import useSession from 'hooks/use-session';
import storage from 'utils/localStorage';
import { UserDataStorageKey } from './data/storage-keys';


const { ToastContainer } = createStandaloneToast()

export let canvasCtx; ``


export let appInitialized = false

const AppView = () => {
  const { colorMode } = useColorMode()
  initColors(colorMode)

  canvasCtx = document.createElement('canvas').getContext('2d')!;
  const { session } = useSession()
  const toast = useToast()

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
    if (session) {
      if (session.user.data) {
        storage.set(UserDataStorageKey, session.user.data)
      }
    }
  }, [session])

  const [cfg, setConfig] = useState<UIConfig>($config.get())

  const teamPath = useMemo(() => {
    let firstIndex;
    let secondIndex;
    let i = 0;
    for (const c of location.pathname) {
      if (c == '/') {
        if (firstIndex === undefined) {
          firstIndex = i;
          i++
          continue
        }

        if (secondIndex === undefined) {
          secondIndex = i
          break
        }
      }
      i++
    }

    const teamPath = location.pathname.slice(firstIndex + 1, secondIndex)
    return teamPath
  }, [location.pathname])

  const teamId = Number(teamPath)





  const loadConfig = async () => {
    const res = await requestApi.get(`/config/ui${isNaN(teamId) ? '' : `?teamId=${teamId}`}`)

    const cfg: UIConfig = res.data
    if (cfg.currentTeam != teamId && location.pathname != "" && location.pathname != "/") {
      toast({
        title: `You have no privilege to view team ${teamPath}, please visit root path to navigate to your current team`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      })

      // let newPath
      // if (location.pathname == "" || location.pathname == "/") {
      //   newPath = `/${cfg.currentTeam}`
      // } else {
      //   newPath = location.pathname.replace(`/${teamPath}`, `/${cfg.currentTeam}`)
      // }
      // setTimeout(() => {
      //   window.location.href = newPath
      // }, 1500)
      return 
    }


   
    cfg.sidemenu = (cfg.sidemenu as any).data.filter((item) => !item.hidden)
    setConfig(cfg)
    $config.set(cfg)
  }


  const router = createBrowserRouter(getRoutes(true));

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
