import { Box, Flex, HStack, Text, IconButton, useColorModeValue } from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';


const TestPage = () => {    
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
        <Box ref={ref} width={"100%"} height="800px"></Box>
   )
}
export default TestPage
