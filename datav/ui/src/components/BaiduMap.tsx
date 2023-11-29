//@ts-nocheck
// Copyright 2023 xObserve.io Team

import React, { useEffect } from 'react'

export function loadBMap(ak) {
  return new Promise(function (resolve, reject) {
    if (typeof BMap !== 'undefined') {
      resolve(BMap)
      return true
    }

    window.onBMapCallback = function () {
      resolve(BMap)
    }
    // let link = document.createElement("link")
    // link.href = "/scripts/mapbox-gl.css"
    // link.rel = "stylesheet"
    // document.head.appendChild(link)

    // let script0 = document.createElement('script')
    // script0.type = 'text/javascript'
    // script0.src = '/scripts/mapbox-gl.js'
    // script0.onerror = reject
    // document.head.appendChild(script0)

    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://api.map.baidu.com/api?v=2.0&ak=' +
      ak +
      '&__ec_v__=20190126&callback=onBMapCallback'
    script.onerror = reject
    document.head.appendChild(script)
  })
}

interface Props {
  ak: string
}

const BaiduMap = ({ ak }: Props) => {
  useEffect(() => {
    loadBMap(ak)
  }, [])

  return <></>
}

export default BaiduMap
