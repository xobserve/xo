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
import { Box } from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { PanelProps } from "types/dashboard";
import { SeriesData } from "types/seriesData";

interface Props extends PanelProps {
    data: SeriesData[][]
}


const GeoMapPanel = (props: Props) => {    
    const {width, height, panel,data} = props
    console.log("here33333:",data)
    const base = "https://services.arcgisonline.com/ArcGIS/rest/services/"
    const svc = "World_Street_Map"
    const ref = useRef(null)
    useEffect(() => {
        const map = new Map({
            target: ref.current,
            layers: [
              new TileLayer({
                source: new XYZ({
                  url: `${base}${svc}/MapServer/tile/{z}/{y}/{x}`
                })
              })
            ],
            view: new View({
              center: [0, 0],
              zoom: 2
            })
          });
    
    },[])


    return (
        <Box ref={ref} width={width} height={height}></Box>
   )
}
export default GeoMapPanel
