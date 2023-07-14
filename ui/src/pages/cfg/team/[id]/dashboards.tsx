import { Box, Button,  useToast,Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Flex } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import Page from "layouts/page/Page"
import moment from "moment"
import React, { useEffect, useRef, useState } from "react"
import { FaUserFriends } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import ReserveUrls from "src/data/reserve-urls"
import { commonMsg } from "src/i18n/locales/en"
import { Dashboard } from "types/dashboard"
import { Route } from "types/route"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { getTeamSubLinks } from "./utils"


const TeamDashboardsPage = () => {
    const t = useStore(commonMsg)
    const navigate = useNavigate()
    const params = useParams()
    const id = params.id
    const tabLinks: Route[] = getTeamSubLinks(id)

    const [team, setTeam] = useState<Team>(null)
    const [dashboards, setDashboards] = useState<Dashboard[]>([])


    useEffect(() => {
        if (id) {
            load()
        }
    }, [id])

    const load = async () => {
        const res = await requestApi.get(`/team/${id}`)
        setTeam(res.data)
        const res1 = await requestApi.get(`/dashboard/team/${id}`)
        setDashboards(res1.data)
    }


    return <>
        {id && <Page title={`Manage your team`} subTitle={`Current team - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
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
        </Page>}

    </>
}

export default TeamDashboardsPage