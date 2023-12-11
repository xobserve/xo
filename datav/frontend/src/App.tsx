// Copyright 2023 xobserve.io Team
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
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import React, { useEffect } from 'react'
import { createStandaloneToast } from '@chakra-ui/toast'
import CommonStyles from 'src/theme/common.styles'
import AntdWrapper from 'src/components/AntdWrapper'
import { getRoutes } from './routes'
import { initColors } from 'utils/colors'
import useSession from 'hooks/use-session'
import storage from 'utils/localStorage'
import { UserDataStorageKey } from './data/storage-keys'
import { URL_ROOT_PATH } from './data/configs/config'

const { ToastContainer } = createStandaloneToast()

export let canvasCtx

export let appInitialized = false
const AppView = () => {
  const { colorMode } = useColorMode()
  initColors(colorMode)

  canvasCtx = document.createElement('canvas').getContext('2d')!
  const { session } = useSession()

  useEffect(() => {
    const firstPageLoading = document.getElementById('first-page-loading')
    if (firstPageLoading) {
      firstPageLoading.style.display = 'none'
    }

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

  const router = createBrowserRouter(getRoutes(true))

  return (
    <>
      <AntdWrapper>
        <RouterProvider router={router} />
      </AntdWrapper>

      <CommonStyles />
      <ToastContainer />
      {/* {cfg && cfg.panel.echarts.enableBaiduMap && <BaiduMap ak={cfg.panel.echarts.baiduMapAK} />} */}
    </>
  )
}

export default AppView
