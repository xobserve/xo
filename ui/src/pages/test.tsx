import { Box } from "@chakra-ui/react"
import React from "react"
import ct from 'public/plugins/panel/geomap/countries.json'


const TestPage = () => {
  
  const cts = {}
  ct.forEach((c) => {
    const code = c.key || c.keys[0]
    const coords = [c.longitude, c.latitude]
    cts[code.toLowerCase()] = [c.name, coords]
  })

  console.log("here333333:", cts)
  return (
    <Box>{JSON.stringify(cts, null, 2)}</Box>
  )
}
export default TestPage
