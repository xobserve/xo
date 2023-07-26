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

import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react"
import React, { useState } from "react"
import { AiFillStar, AiOutlineStar } from "react-icons/ai"
import { FaStar } from "react-icons/fa"
import { requestApi } from "utils/axios/request"

interface Props {
    dashboardId: string 
    starred?: boolean
    fontSize?: string
    colorScheme?: "gray" | "orange"
    enableClick?: boolean
}

const DashboardStar = (props: Props) => {
    const {dashboardId,fontSize="1rem", colorScheme="orange", enableClick=true} = props
    const [starred, setStarred] = useState(props.starred)


    const load = async () => {
        const res = await requestApi.get(`/dashboard/starred/${dashboardId}`)
        setStarred(res.data)
    }

    if (starred === undefined) {
        load()
    }

    const onStar = async () => {
        if (!starred) {
            await requestApi.post(`/dashboard/star/${dashboardId}`)
        } else {
            await requestApi.post(`/dashboard/unstar/${dashboardId}`)
        }
       
        setStarred(!starred)
    }
    return (<Box cursor="pointer" onClick={enableClick ? onStar : null} fontSize={fontSize} color={colorScheme == "orange" ? useColorModeValue("orange.300","orange.200" ): 'inherit'}>
        {starred ? <AiFillStar /> : <AiOutlineStar />}
        </Box>)
}

export default DashboardStar