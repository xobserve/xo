// Copyright 2023 xObserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import React from "react"
import { Image, Text, VStack } from "@chakra-ui/react"

const Empty = () => {

  return (
    <VStack spacing="16" py="16">
    <Text fontSize="1.2rem">Moommm..It seems there are nothing here ..</Text>
    <Image src="/empty.svg" height="260px" />
  </VStack>
  )
} 

export default Empty
