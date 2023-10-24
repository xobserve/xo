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

import { Box, Text, useMediaQuery } from "@chakra-ui/react"
import InputWithTips from "components/input/InputWithTips"
import React, { useState } from "react"
import { useSearchParam } from "react-use"
import { PanelForceRequeryEvent } from "src/data/bus-events"
import { Panel } from "types/dashboard"
import { dispatch } from "use-bus"
import { $datavQueryParams } from "../../datasource/datav/store"

interface Props {
    panel: Panel
}
const Search = ({ panel }: Props) => {
    const [isSmallScreen] = useMediaQuery('(max-width: 1200px)')
    const isLargeScreen = !isSmallScreen
    const [query, setQuery] = useState('')
    const edit = useSearchParam("edit")

    const onSearch = () => {
        const params = $datavQueryParams.get()
        $datavQueryParams.set({
            ...params,
            search: query
        })

        dispatch(PanelForceRequeryEvent + panel.id)
    }

    const inputWidth = 400
    return (<Box position={(isLargeScreen && !edit) ? "fixed" : null} left={(isLargeScreen && !edit) ? `calc(50% - ${inputWidth}px)` : null} top="5px" display="flex" alignItems="center" justifyContent="center" zIndex={1002} width={500}>
        <InputWithTips placeholder="Search your logs, press Enter to submit..." width={isLargeScreen ? inputWidth : "100%"} value={query} onChange={setQuery} onConfirm={onSearch}>
            <Text>aaaa</Text>
        </InputWithTips>
        {/* {!isLargeScreen && <Button size="sm" variant="outline">Submit</Button>} */}
    </Box>)
}

export default Search