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

import { Box, Button, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Flex } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ReserveUrls from "src/data/reserve-urls"
import { commonMsg } from "src/i18n/locales/en"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import TeamLayout from "./components/Layout"




const TeamDashboardsPage = () => {
    return <>
        <TeamLayout>
            {/* @ts-ignore */}
            <TeamDashboards />
        </TeamLayout>

    </>
}

export default TeamDashboardsPage



const TeamDashboards = ({team}: {team:Team}) => {
    const t = useStore(commonMsg)
    const navigate = useNavigate()

    const [dashboards, setDashboards] = useState<Dashboard[]>([])


    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res1 = await requestApi.get(`/dashboard/team/${team.id}`)
        setDashboards(res1.data)
    }


    return <>
        <Box>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={() => navigate(`${ReserveUrls.New}/dashboard`)}>{t.newItem({name: t.dashboard})}</Button>
            </Flex>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>{t.name}</Th>
                            <Th>Id</Th>
                            <Th>{t.created}</Th>
                            <Th>{t.updated}</Th>
                            <Th>{t.action}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {dashboards.map(dash => {
                            return <Tr key={dash.id}>
                                <Td>{dash.title}</Td>
                                <Td>{dash.id}</Td>
                                <Td>{moment(dash.created).fromNow()}</Td>
                                <Td>{moment(dash.updated).fromNow()}</Td>
                                <Td>
                                    <Button variant="ghost" size="sm" px="0" onClick={() => navigate(`/${dash.id}`)}>{t.manage}</Button>
                                </Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    </>
}