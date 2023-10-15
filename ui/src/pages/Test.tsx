import { Box } from "@chakra-ui/react"
import React from "react"
import countries from 'public/plugins/panel/geomap/countries.json'


const TestPage = () => {
 
  return (
    <>
    <p>Iframe header tips</p>
    <iframe src="http://localhost:5173/home?&embed=true&fullscreen=on&from=now-12h&to=now&toolbar=on&viewPanel=8&colorMode=dark" height={500} width={800}/>
    <p>Iframe footer tips</p>
    <iframe src="http://localhost:5173/home?&embed=true&fullscreen=on&from=now-12h&to=now&toolbar=on&viewPanel=4&colorMode=light" height={500} width={800}/>
    <iframe src="http://localhost:5173/home?&embed=true&fullscreen=on&from=now-12h&to=now&toolbar=on&colorMode=dark" height={500} width={800}/>
    </>
  )
}
export default TestPage


