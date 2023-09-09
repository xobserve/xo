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
import { Box, Center, useToast } from "@chakra-ui/react"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import Map from 'ol/Map';
import View from 'ol/View';
import { PanelProps } from "types/dashboard";
import { SeriesData } from "types/seriesData";
import getHeatmapLayer from "./layers/dataLayer/heatmap";
import getBaseMap from "./layers/basemap/baseMap";
import { DataLayerType } from "types/plugins/geoMap";
import getMarkersLayer from "./layers/dataLayer/markers";
import { fromLonLat } from "ol/proj";
import { MouseWheelZoom, defaults as interactionDefaults } from "ol/interaction";
import Zoom from 'ol/control/Zoom';
import ScaleLine from 'ol/control/ScaleLine';
import Attribution from 'ol/control/Attribution';
import { GeomapTooltip } from "./components/Tooltip";
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { isSeriesData } from "utils/seriesData";
import { isEmpty } from "utils/validate";
import { genDynamicFunction } from "utils/dashboard/dynamicCall";
import { isFunction } from "lodash";
import { gnavigate } from "layouts/PageContainer";
import { setVariable } from "src/views/variables/SelectVariable";
import { setDateTime } from "src/components/DatePicker/DatePicker";
import { $variables } from "src/views/variables/store";
import NoData from "src/views/dashboard/components/PanelNoData";

interface Props extends PanelProps {
    data: SeriesData[][]
}

export let geomap: Map = null

const GeoMapPanelWrapper = memo((props: Props) => {
    if (isEmpty(props.data)) {
        return <Center height="100%"><NoData /></Center>
    }

    if (!isSeriesData(props.data)) {
        return (<Center height="100%">Data format not support!</Center>)
    }

    return (<>
        <GeoMapPanel {...props} />
    </>
    )
})

export default GeoMapPanelWrapper


const GeoMapPanel = (props: Props) => {
    const toast = useToast()
    const { width, height, panel, data } = props
    const [map, setMap] = useState<Map>(null)
    const mouseWheelZoom = useRef<MouseWheelZoom>(null)
    const options = panel.plugins.geomap
    const mapContainer = useRef(null)
    

    if (!isSeriesData(props.data)) {
        return (<Center height="100%">Data format not support!</Center>)
    }


    let dataLayer = useMemo(() => {
        let dataLayer 
        switch (options.dataLayer.layer) {
            case DataLayerType.Heatmap:
                dataLayer = getHeatmapLayer()
                break;
            case DataLayerType.Markers:
                dataLayer = getMarkersLayer(panel)
                break
            default:
                break;
        }
        return dataLayer
    },[options.dataLayer.layer])


    // effects which cause data to change
    useEffect(() => {
        if (dataLayer) {
            const source = dataLayer.getSource()
            //@ts-ignore
            source.update(data.flat(), panel)
            if (options.dataLayer.layer == DataLayerType.Heatmap) {
                source.forEachFeature((f) => {
                    const idx = f.get('rowIndex') as number;
                    if (idx != null) {
                        f.set('_weight', 0.5);
                    }
                });
            }
        }


    }, [data,dataLayer, options.baseMap, options.dataLayer, options.thresholds,options.value, panel.overrides])

    // effects which cause map view to change
    useEffect(() => {
        if (map) {
            const view = map.getView()
            view.setCenter(fromLonLat(options.initialView.center))
            view.setZoom(options.initialView.zoom)
        }
    }, [options.initialView])

    // effects which cause interactions to change
    useEffect(() => {
        if (map) {
            initControls(map)
        }
    }, [options.controls])

    // effects which need to re-create the map
    useEffect(() => {
        const baseMap = getBaseMap(panel.plugins.geomap)
        const layers = [baseMap]
        if (dataLayer) {
            layers.push(dataLayer)
        }
        const map = new Map({
            target: mapContainer.current,
            layers: layers,
            view: new View({
                center: fromLonLat(options.initialView.center ?? [0, 0]),
                zoom: options.initialView.zoom ?? 2,
                // showFullExtent: true, // allows zooming so the full range is visible
            }),
            interactions: interactionDefaults({
                mouseWheelZoom: false, // managed by initControls
            }),
        });

        mouseWheelZoom.current = new MouseWheelZoom();
        map.addInteraction(mouseWheelZoom.current);

        initControls(map)

        setMap(map)
        geomap = map

        if (options.value,options.enableClick) {
            const onClick = genDynamicFunction(panel.plugins.geomap.onClickEvent);
            map.on('click', function(e) {
                var item = map.getFeaturesAtPixel(e.pixel);
                if (item !== null) {
                    //@ts-ignore
                    if (isFunction(onClick)) {
                        onClick(item, map, gnavigate, (k, v) => setVariable(k, v), setDateTime, $variables)
                    } else {
                        toast({
                            title: "on click event error",
                            description: "The function you defined is not valid",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                        })
                    }

                
                }
              });
              
              map.on('pointermove', function(e){
                var pixel = map.getEventPixel(e.originalEvent);
                var hit = map.hasFeatureAtPixel(pixel);
                map.getViewport().style.cursor = hit ? 'pointer' : '';
              });
        }

          
        return () => {
            map.dispose()
        }
    }, [options.baseMap, options.dataLayer, options.value,options.enableClick, options.onClickEvent])

 

    const initControls = (map) => {
        map.getControls().clear()
        mouseWheelZoom.current.setActive(options.controls.enableZoom)
        if (options.controls.showZoom) {
            map.addControl(
                new Zoom()
            );
        }


        if (options.controls.showScale) {
            map.addControl(
                new ScaleLine({
                    minWidth: 100,
                })
            );
        }

        if (options.controls.showAttribution) {
            map.addControl(new Attribution({ collapsed: true, collapsible: true }));
        }

    }


    return (
        <>
            <Box ref={mapContainer} width={width} height={height}>
                {map && options.controls.showTooltip &&  <GeomapTooltip map={map} />}
            </Box>
        </>
    )
}



