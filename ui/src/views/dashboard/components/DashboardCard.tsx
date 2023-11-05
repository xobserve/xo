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

import { Box, Flex, HStack, Highlight, Tag, Text, useOutsideClick } from "@chakra-ui/react"
import ColorTag from "src/components/ColorTag"
import CopyToClipboard from "src/components/CopyToClipboard"
import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { getDashboardLink } from "utils/dashboard/dashboard"
import DashboardStar from "./DashboardStar"
import { Divider, InputNumber } from "antd"
import { EditorNumberItem } from "src/components/editor/EditorItem"
import { requestApi } from "utils/axios/request"
import { dispatch } from "use-bus"
import { OnDashboardWeightChangeEvent } from "src/data/bus-events"
import { Session } from "types/user"
import { isAdmin } from "types/role"


interface Props {
    dashboard: Dashboard
    owner: Team
    query: string
    onClick?: any
    starred: boolean
    session?: Session
}

const DashboardCard = ({ dashboard, owner, query, onClick, starred, session }: Props) => {
    const [active, setActive] = useState(false)
    const navigate = useNavigate()
    const [weight, setWeight] = useState(null)
    const ref = useRef()
    useOutsideClick({
        ref: ref,
        handler: () => setWeight(null),
    })
    const submitWeight = async () => {
        await requestApi.post("/dashboard/weight", {id: dashboard.id, weight})
        setWeight(null)
        dashboard.weight = weight
        dispatch(OnDashboardWeightChangeEvent)
    }

    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            className="label-bg hover-bg"
            p="2"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
        >
            <Box>
                <Flex alignItems="center" cursor="pointer" onClick={() => {
                        navigate(getDashboardLink(dashboard.id))
                        onClick && onClick()
                    }}>
                    <Text><Highlight query={query ?? ""} styles={{ bg: 'var(--chakra-colors-brand-100)' }} >{dashboard.title}</Highlight></Text>
                    {location.pathname == '/' + dashboard.id && <Tag ml="1">current</Tag>}
                    {(query || active) &&
                        <Flex alignItems="center" ml="2">
                            <Text textStyle="annotation" mb="-2px"><Highlight query={query ?? ""} styles={{ bg: 'var(--chakra-colors-brand-100)' }}>{dashboard.id}</Highlight></Text>
                            <Box ml="1" mb="-3px"><CopyToClipboard copyText={dashboard.id} tooltipTitle="copy dashboard id" fontSize="0.8rem" /></Box>
                        </Flex>}
                </Flex>
                <HStack alignItems="center" mt="2" spacing={1}>
                    <Text minWidth="fit-content" textStyle="annotation">{owner?.name}</Text>
                   
                    {isAdmin(session?.user.role) && <>
                        <Divider type="vertical" />
                    {weight === null
                        ?
                        <Text textStyle="annotation" cursor="text" onClick={(e) => {
                            setWeight(dashboard.weight)
                            e.stopPropagation()
                        }}>{dashboard.weight}</Text>
                        :
                        <InputNumber ref={ref} value={weight} min={0} max={500} step={1} onChange={v => {
                            setWeight(v??0)
                        }} onKeyDown={e => {
                            if (e.key === 'Enter') {
                                submitWeight()
                            }
                        }} />}
                    </>}
                    {starred && <>
                        <Divider type="vertical" />
                        <DashboardStar dashboardId={dashboard.id} colorScheme="gray" enableClick={false} starred />
                    </>}
                </HStack>
            </Box>
            <HStack>
                {
                    dashboard.tags?.sort().map((tag, index) => {
                        return <ColorTag name={tag} />
                    })
                }
            </HStack>
        </Flex>)
}

export default DashboardCard