import { Box, Button, HStack, Input, InputGroup, InputLeftAddon, Select, Text, useToast, VStack } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import { Dashboard } from "types/dashboard"
import { globalTeamId, Team } from "types/teams"
import { requestApi } from "utils/axios/request"

const newTitle = "new dashboard"
const TeamsPage = () => {
    const toast = useToast()
    const router = useRouter()
    const [dashboard, setDashboard] = useState<Dashboard>({
        id: "",
        title: newTitle,
        data: {
            panels: []
        },
        ownedBy: globalTeamId,
    })
    const [teams, setTeams] = useState<Team[]>([])

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("teams/all")
        setTeams(res.data)
    }

    const addDashboard = async () => {
        const res = await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard added, redirecting...",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            router.push(`/${res.data}`)
        }, 1000)
    }

    return <>
        <Page title={`New`} subTitle="Create some useful items" icon={<FaPlus />} tabs={newLinks}>
            <VStack alignItems="left" spacing={4}>
                <Box mb="2" textStyle="subTitle">Dashboard info</Box>
                <InputGroup>
                    <InputLeftAddon children='Dashboard Title' />
                    <Input value={dashboard.title} onChange={e => {dashboard.title=e.currentTarget.value; setDashboard(cloneDeep(dashboard))}} />
                </InputGroup>
                <InputGroup>
                    <InputLeftAddon children='Description' />
                    <Input placeholder='give your dashboard a short description' value={dashboard.data.description} onChange={e => setDashboard(cloneDeep(dashboard))} />
                </InputGroup>
                <InputGroup>
                    <InputLeftAddon children='Belongs to team' />
                    <Box sx={{
                        '.chakra-select': {
                            paddingLeft: '15px'
                        }
                        }}>
                    <Select  value={dashboard.ownedBy} variant="flushed" onChange={e => setDashboard({...dashboard, ownedBy: Number(e.currentTarget.value)})}>
                       {teams.map(team => <option key={team.id} value={team.id}>
                            <Text>{team.name}</Text>
                       </option>)}
                    </Select>
                    </Box>
                </InputGroup>
                <Button width="fit-content" onClick={addDashboard}>Submit</Button>
            </VStack>
        </Page>
    </>
}


export default TeamsPage