import React from "react"
import { Image, Text, useColorModeValue, VStack } from "@chakra-ui/react"

const Empty = () => {
  return (
    <VStack spacing="16" py="16">
    <Text fontSize="1.2rem">这里好像什么都没有哦！</Text>
    <Image src="/empty.svg" height="260px" />
  </VStack>
  )
} 

export default Empty
