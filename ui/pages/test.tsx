import { Box, HStack, Text } from "@chakra-ui/react"
import PopoverSelect from "components/select/PopoverSelect"
import { useState } from "react"

const TestPage = () => {
    const [value, setValue] = useState([])

    
    return (<Box width="200px" height="50px">
    <PopoverSelect value={value} options={options} onChange={setValue} exclusive="all" size="lg" placeholder="enter variable value to search..." isMulti isClearable />
    </Box>)
}

export default TestPage


const options = [
  {
    label: "All",
    value: "all"
  },
  {
  label: "a",
  value: "a"
},{
  label: "b",
  value: "b"
},{
  label: "c",
  value: "c"
},{
  label: "d",
  value: "d"
},{
  label: "e",
  value: "e"
}]