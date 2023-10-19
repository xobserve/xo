// Copyright 2023 Datav.io Team
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

import { Box, Input, useMediaQuery } from "@chakra-ui/react"
import React from "react"
import { MobileBreakpoint } from "src/data/constants"

const Search = () => {
    const [isLargeScreen] = useMediaQuery('(min-width: 1200px)')
    return (<Box position={isLargeScreen ? "fixed" : null} left={isLargeScreen ? "-50px" : null} top="5px" display="flex" alignItems="center" justifyContent="center" zIndex={10000} width="100%">
        <Input  width="500px" variant="flushed" placeholder="Search your logs..."/>
        </Box>)
}

export default Search