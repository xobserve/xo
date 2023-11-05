// Copyright 2023 observex.io Team
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
import { Button, useColorModeValue } from "@chakra-ui/react"

const IconButton = ({ children, fontSize = "1.1rem", variant = "outline",size="md", ...rest }) => {
  return <Button
    size={size}
    variant={variant}
    p="0"
    borderColor="inherit"
    color={useColorModeValue("var(--chakra-colors-gray-600)", "var(--chakra-colors-whiteAlpha-900)")}
    fontSize={fontSize}
    sx={{
      span: {
        display: "flex",
        justifyContent: "center"
      }
    }}
    {...rest}
  >
    {children}
  </Button>
}

export default IconButton