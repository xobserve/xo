import { Box } from "@chakra-ui/react"
import React from "react"
import countries from 'public/plugins/panel/geomap/countries.json'


const TestPage = () => {
  const cnames = {}
//   "ad": [
//     "Andorra",
//     [
//         1.601554,
//         42.546245
//     ]
// ],
  for (const code of Object.keys(countries)) {
    const v = countries[code]
    const name: string = v[0]
    const coords = v[1]
    cnames[name.toLowerCase()] = [code, coords]
  }

  console.log("here33333:", cnames)
  return (
    <Box></Box>
  )
}
export default TestPage


