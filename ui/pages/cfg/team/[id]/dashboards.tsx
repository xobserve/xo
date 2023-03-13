import { Box, Button,  useToast,Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Flex } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import moment from "moment"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Route } from "types/route"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"

const TeamDashboardsPage = () => {
    const router = useRouter()
    const toast = useToast()
    const id = router.query.id
    const tabLinks: Route[] = [
        { title: "Members", url: `/cfg/team/${id}/members`, icon: <FaUserFriends /> },
        { title: "Dashboards", url: `/cfg/team/${id}/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "Side menu", url: `/cfg/team/${id}/sidemenu`, icon: <FaAlignLeft /> },
        { title: "Setting", url: `/cfg/team/${id}/setting`, icon: <FaCog /> },
    ]

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
                <Button size="sm" onClick={() => router.push(`${ReserveUrls.New}/dashboard`)}>Add new dashboard</Button>
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
                                    <Button variant="ghost" size="sm" px="0" onClick={() => router.push(`/${dash.id}`)}>View</Button>
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