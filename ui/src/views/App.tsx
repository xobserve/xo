import { ChakraProvider, useToast } from '@chakra-ui/react'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import FontFace from 'components/font-face'
import theme from 'theme'
import { createStandaloneToast } from '@chakra-ui/toast'
import CommonStyles from "src/theme/common.styles"
import NoSSR from 'react-no-ssr';
import BaiduMap from 'components/BaiduMap'
import { requestApi } from 'utils/axios/request'
import { config, UIConfig } from 'src/data/configs/config'
import { Datasource } from 'types/datasource'
import { Variable } from 'types/variable'
import { queryVariableValues, setVariableSelected } from './variables/Variables'
import { VarialbeAllOption } from 'src/data/variable'

const { ToastContainer } = createStandaloneToast()




export let canvasCtx;
export let datasources: Datasource[] = []
export let gvariables: Variable[] = []
export let gtoast
//@ts-ignore
const AppView = ({ Component, pageProps }) => {
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
        v.values = res1.data??[]
      }
      // get the selected value for each variable from localStorage
    }
    gvariables = res.data
  }

  return (
    <NoSSR>
      <Head>
        <meta content='IE=edge' httpEquiv='X-UA-Compatible' />
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://static.cloudflareinsights.com' />
        <meta name='theme-color' content='#319795' />
        {process.env.NODE_ENV === 'production' && (
          <script
            async
            defer
            data-domain='chakra-ui.com'
            src='https://plausible.io/js/plausible.js'
          />
        )}
      </Head>
      {cfg && <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>}
      <FontFace />
      <CommonStyles />
      <ToastContainer />
      {cfg && cfg.panel.echarts.enableBaiduMap && <BaiduMap ak={cfg.panel.echarts.baiduMapAK} />}
    </NoSSR>
  )
}

export default AppView
