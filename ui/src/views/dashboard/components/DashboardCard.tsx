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

import { Box, Flex, HStack, Highlight, Tag, Text } from "@chakra-ui/react"
import ColorTag from "components/ColorTag"
import CopyToClipboard from "components/CopyToClipboard"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { getDashboardLink } from "utils/dashboard/dashboard"


interface Props {
    dashboard: Dashboard
    owner: Team
    query: string
    onClick?: any
}

const DashboardCard = ({ dashboard, owner,query,onClick }: Props) => {
    const [active, setActive] = useState(false)
    const navigate = useNavigate()

    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            className="label-bg hover-bg"
            p="2"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            cursor="pointer"
            onClick={() => {
                navigate(getDashboardLink(dashboard.id))
                onClick && onClick()
            }}
        >
            <Box>
                <Flex alignItems="center">
                    <Text><Highlight query={query??""} styles={{bg: 'cyan.100'}} >{dashboard.title}</Highlight></Text>
                    {location.pathname == '/' + dashboard.id && <Tag ml="1">current</Tag>}
                    {(query || active) &&
                        <Flex alignItems="center" ml="2">
                            <Text textStyle="annotation" mb="-2px"><Highlight query={query??""} styles={{bg: 'cyan.100' }}>{dashboard.id}</Highlight></Text>
                            <Box ml="1" mb="-3px"><CopyToClipboard copyText={dashboard.id} tooltipTitle="copy dashboard id" fontSize="0.8rem" /></Box>
                        </Flex>}
                </Flex>
                <Text minWidth="fit-content" mt="2" textStyle="annotation">{owner?.name}</Text>
            </Box>
            <HStack>
                {
                    dashboard.tags?.map((tag, index) => {
                        return <ColorTag name={tag} />
                    })
                }
            </HStack>
        </Flex>)
}

export default DashboardCard