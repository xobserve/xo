import { Box } from "@chakra-ui/react"
import React from "react"
import worldCities from 'public/plugins/panel/geomap/worldcities.json'
import { lowerCase, toNumber } from "lodash"


const TestPage = () => {
  
  // {
  //   "city": "Yaupi",
  //   "city_ascii": "Yaupi",
  //   "lat": "-2.8379",
  //   "lng": "-77.9357",
  //   "country": "Ecuador",
  //   "iso2": "EC",
  //   "iso3": "ECU",
  //   "admin_name": "Morona-Santiago",
  //   "capital": "",
  //   "population": "293",
  //   "id": "1218516951"
  // },
  const countryCitys = {}
  worldCities.forEach((city) => {
    const cityName = lowerCase(city["city_ascii"].toString())
    const coords = [toNumber(city.lng), toNumber(city.lat)]
    const countryCode = lowerCase(city.iso2)
    if (!countryCitys[countryCode]) {
      countryCitys[countryCode] = {
        [cityName]: [countryCode, coords]
      } 
    } else {
      countryCitys[countryCode][cityName] = [countryCode, coords]
    }
  })

  const cities = new Map()
  for (const k of Object.keys(countryCitys)) {
    const cs = countryCitys[k]
    for (const cityName of Object.keys(cs)) {
      cities[cityName] = cs[cityName]
    }
  }
  console.log("here333333:", cities)
  return (
    <Box>{JSON.stringify(cities, null, 2)}</Box>
  )
}
export default TestPage
