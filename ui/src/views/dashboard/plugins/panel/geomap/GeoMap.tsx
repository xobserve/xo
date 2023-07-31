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
import getHeatmapLayer from "./layers/dataLayer/heatmap";
import getBaseMap from "./layers/basemap/BaseMap";
import { DataLayerType } from "types/plugins/geoMap";
import getMarkersLayer from "./layers/dataLayer/markers";

interface Props extends PanelProps {
    data: SeriesData[][]
}


const GeoMapPanel = (props: Props) => {
    const { width, height, panel, data } = props
    const options = panel.plugins.geomap
    console.log("here33333:", data)
    const ref = useRef(null)
    let dataLayer;
    switch (options.dataLayer.layer) {
        case DataLayerType.Heatmap:
            dataLayer = getHeatmapLayer()
            break;
        case DataLayerType.Markers:
            dataLayer = getMarkersLayer()
            break
        default:
            break;
    }


    useEffect(() => {
        if (dataLayer) {
            const source = dataLayer.getSource()
            //@ts-ignore
            source.update(data.flat(),panel)
            if (options.dataLayer.layer == DataLayerType.Heatmap) {
                source.forEachFeature((f) => {
                    const idx = f.get('rowIndex') as number;
                    if (idx != null) {
                        f.set('_weight', 0.5);
                    }
                });
            }
        }

    }, [data,options.baseMap, options.dataLayer, options.thresholds])

    useEffect(() => {
        const baseMap = getBaseMap(panel.plugins.geomap)
        const layers = [baseMap]
        if (dataLayer) {
            layers.push(dataLayer)
        }
        const map = new Map({
            target: ref.current,
            layers: layers,
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });

        return () => {
            map.dispose()
        }
    }, [options])


    return (
        <Box ref={ref} width={width} height={height}></Box>
    )
}
export default GeoMapPanel
