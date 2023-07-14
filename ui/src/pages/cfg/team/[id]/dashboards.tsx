import { Box, Button, useToast, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Flex } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import moment from "moment"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
                <Button size="sm" onClick={() => navigate(`${ReserveUrls.New}/dashboard`)}>Add new dashboard</Button>
            </Flex>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Title</Th>
                            <Th>Id</Th>
                            <Th>Created</Th>
                            <Th>Updated</Th>
                            <Th>Actions</Th>
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
                                    <Button variant="ghost" size="sm" px="0" onClick={() => navigate(`/${dash.id}`)}>View</Button>
                                </Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    </>
}