import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import FontFace from 'components/font-face'
import theme from 'theme'
import { createStandaloneToast } from '@chakra-ui/toast'
import CommonStyles from "src/theme/common.styles"
import NoSSR from 'react-no-ssr';
import dynamic from "next/dynamic"
import BaiduMap from 'components/BaiduMap'
import { requestApi } from 'utils/axios/request'
import {config, UIConfig} from 'src/data/configs/config'
import { Datasource } from 'types/datasource'

const { ToastContainer} = createStandaloneToast()




export let canvasCtx;
export let datasources: Datasource[] = []
//@ts-ignore
const AppView =  ({ Component, pageProps }) => {
  const [cfg, setConfig] = useState<UIConfig>(null)
  canvasCtx = document.createElement('canvas').getContext('2d')!;

  useEffect(() => {
    loadConfig()
  },[])
  
  const loadConfig = async () => {
    const res0 = await requestApi.get("/datasource/all")
    datasources = res0.data
    const res = await requestApi.get("/config/ui")
    setConfig(res.data)
    Object.assign(config, res.data)
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
