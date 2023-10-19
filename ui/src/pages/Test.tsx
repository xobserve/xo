import { Box, Text } from "@chakra-ui/react"
import React from "react"
import countries from 'public/plugins/panel/geomap/countries.json'
import { Divider } from "antd"
import ColumnResizableTable from "components/table/ColumnResizableTable"


const TestPage = () => {
 
  return (
    <>
      <ColumnResizableTable />
    </>
  )
}
export default TestPage


