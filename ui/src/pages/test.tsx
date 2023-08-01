import { Box, Flex, HStack, Text, IconButton, useColorModeValue } from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import { Map as OpenLayersMap } from 'ol';
import { defaults as interactionDefaults } from 'ol/interaction';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from "ol/proj";


const TestPage = () => {
  const [counter, setCounter] = useState(0)
  let mapDiv
  let map
  const base = "https://services.arcgisonline.com/ArcGIS/rest/services/"
  const svc = "World_Street_Map"
  const ref = useRef(null)
  // useEffect(() => {
  //   const map = new Map({
  //     target: 'map',
  //     layers: [
  //       new TileLayer({
  //         source: new XYZ({
  //           url: `${base}${svc}/MapServer/tile/{z}/{y}/{x}`
  //         })
  //       })
  //     ],
  //     view: new View({
  //       center: [0, 0],
  //       zoom: 2
  //     })
  //   });

  // }, [])
  const initMapRef = async (div: HTMLDivElement) => {
    if (!div) {
      // Do not initialize new map or dispose old map
      return;
    }
    mapDiv = div;
    if (map) {
      map.dispose();
    }


    let view = new View({
      center: [30, 120],
      zoom: 1,
      // showFullExtent: true, // allows zooming so the full range is visible
    });

    const m = new OpenLayersMap({
      view: view,
      pixelRatio: 1, // or zoom?
      layers: [], // loaded explicitly below
      controls: [],
      target: div,
      // interactions: interactionDefaults({
      //   mouseWheelZoom: false, // managed by initControls
      // }),
    })
    // m.getView().setCenter(fromLonLat([30, 120]))
    // m.getView().setZoom(4)

    m.addLayer(new TileLayer({
      source: new XYZ({
        url: `${base}${svc}/MapServer/tile/{z}/{y}/{x}`
      })
    }));

    setTimeout(() => {
      m.getView().setCenter(fromLonLat([120.5149092, 30.9527723]))
      m.getView().setZoom(4)
    },300)

  }
  // map = m; // redundant
  // this.initViewExtent(map.getView(), options.view);

  // this.mouseWheelZoom = new MouseWheelZoom();
  // this.map?.addInteraction(this.mouseWheelZoom);

  // updateMap(this, options);
  // setTooltipListeners(this);
  // notifyPanelEditor(this, layers, layers.length - 1);

  // this.setState({ legends: this.getLegends() });


return (
  <Box ref={initMapRef} width={"100%"} height="800px"></Box>
)
}
export default TestPage
