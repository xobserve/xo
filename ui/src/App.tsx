import { ChakraProvider, useToast } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import React, { useEffect, useState } from 'react'
import theme from 'theme'
import { createStandaloneToast } from '@chakra-ui/toast'
import CommonStyles from "src/theme/common.styles"
import BaiduMap from 'components/BaiduMap'
import { requestApi } from 'utils/axios/request'
import { config, UIConfig } from 'src/data/configs/config'
import { Datasource } from 'types/datasource'
import { Variable } from 'types/variable'
import { queryVariableValues, setVariableSelected } from './views/variables/Variables'
import { VarialbeAllOption } from 'src/data/variable'
import AntdWrapper from 'components/AntdWrapper'

import routes from './routes';

const { ToastContainer } = createStandaloneToast()

export let canvasCtx;
export let datasources: Datasource[] = []
export let gvariables: Variable[] = []
export let gtoast
//@ts-ignore
const AppView = () => {
  const [cfg, setConfig] = useState<UIConfig>(null)
  canvasCtx = document.createElement('canvas').getContext('2d')!;
  const toast = useToast()
  gtoast = toast
  useEffect(() => {
    loadConfig()
    loadVariables()
  }, [])

  const loadConfig = async () => {
    const res0 = await requestApi.get("/datasource/all")
    datasources = res0.data
    const res = await requestApi.get("/config/ui")
    setConfig(res.data)
    Object.assign(config, res.data)
  }

  const loadVariables = async () => {
    const res = await requestApi.get(`/variable/all`)
    for (const v of res.data) {
      v.values = []
      // get the selected value for each variable from localStorage
    }
    setVariableSelected(res.data)

    for (const v of res.data) {
      if (v.selected == VarialbeAllOption) {
        const res1 = await queryVariableValues(v)
        v.values = res1.data ?? []
      }
      // get the selected value for each variable from localStorage
    }
    gvariables = res.data
  }

  const router = createBrowserRouter(routes);
  return (
    <>
      {cfg && <ChakraProvider theme={theme}>
        <AntdWrapper>
          <RouterProvider router={router} /> 
        
        </AntdWrapper>
      </ChakraProvider>}

      <CommonStyles />
      <ToastContainer />
      {cfg && cfg.panel.echarts.enableBaiduMap && <BaiduMap ak={cfg.panel.echarts.baiduMapAK} />}
    </>
  )
}

export default AppView
