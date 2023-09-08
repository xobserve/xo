//@ts-nocheck
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

import React, { useEffect } from "react"

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
        script.src = 'https://api.map.baidu.com/api?v=2.0&ak=' + ak + '&__ec_v__=20190126&callback=onBMapCallback'
        script.onerror = reject
        document.head.appendChild(script)
    })
}

interface Props {
    ak: string 
}

const BaiduMap = ({ak}:Props) => {
    useEffect(() => {
        loadBMap(ak)
    },[])

    return (<></>)
}

export default BaiduMap