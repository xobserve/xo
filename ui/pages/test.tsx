import { Box } from "@chakra-ui/react"

const TestPage = () => {
  return (<Box background="red" width="200px" height="200px" ml="100px" pt="20px">
    <Box background="blue" width="100px" height="100px" ml="4">
    </Box>
    <Box background="blue" width="100px" height="100px" ml="4" mt="4">

    </Box>

    <Box background="blue" width="100px" height="100px" ml="4" mt="4">
      <Box className="relative" background="black" width="50px" height="50px" mt="4" position="relative" top="20px" right="20px">

      </Box>
      <Box className="absolute" position="absolute" width="50px" height="50px" bg="yellow" top="0" left="0">

      </Box>
      <Box background="black" width="50px" height="5000px">

      </Box>
    </Box>
  </Box>)
}


export default TestPage