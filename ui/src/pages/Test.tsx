import { Box } from "@chakra-ui/react"
import React from "react"
import countries from 'public/plugins/panel/geomap/countries.json'


const TestPage = () => {
 
  return (
    <iframe src="http://localhost:5173/home?&embed=true&fullscreen=on&from=now-12h&to=now&toolbar=on&viewPanel=8" height={500} width={800}/>
  )
}
export default TestPage


