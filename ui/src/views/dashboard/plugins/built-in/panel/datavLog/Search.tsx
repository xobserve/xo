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
import useBus, { dispatch } from "use-bus"
import { isEmpty } from "utils/validate"
import { $datavQueryParams } from "../../datasource/datav/store"

interface Props {
    panel: Panel
}

export const OnLogSearchChangeEvent = "on-log-search-change"
const Search = ({ panel }: Props) => {
    const [isSmallScreen] = useMediaQuery('(max-width: 1200px)')
    const isLargeScreen = !isSmallScreen
    const [query, setQuery] = useState('')
    const edit = useSearchParam("edit")

    useBus(
        (e) => { return e.type == OnLogSearchChangeEvent + panel.id },
        (e) => {
            const { query: q, isNew } = e.data
            console.log("here333333:", e.data)
            let newQuery;
            if (isNew) {
                newQuery = q
            } else {
                if (isEmpty(query)) {
                    newQuery = q
                } else {
                    newQuery = (query + ' AND ' + q)
                }
            }
            setQuery(newQuery)
            onSearch(newQuery)
        },
        [query]
    )

    const onSearch = (q?:string) => {
        const params = $datavQueryParams.get()
        $datavQueryParams.set({
            ...params,
            search: (q??query).toLowerCase()
        })

        dispatch(PanelForceRequeryEvent + panel.id)
    }

    const inputWidth = 500
    return (<Box position={(isLargeScreen && !edit) ? "fixed" : null} left={(isLargeScreen && !edit) ? `calc(50% - ${inputWidth/2}px)` : null} top="5px" display="flex" alignItems="center" justifyContent="center" zIndex={1002} width={500}>
        <InputWithTips placeholder="Search your logs, press Enter to submit..." width={isLargeScreen ? inputWidth : "100%"} value={query} onChange={setQuery} onConfirm={onSearch} size="sm">
            <Text>aaaa</Text>
        </InputWithTips>
        {/* {!isLargeScreen && <Button size="sm" variant="outline">Submit</Button>} */}
    </Box>)
}

export default Search