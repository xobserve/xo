import { Box, Button, HStack, Input, InputGroup, InputLeftAddon, Select, Text, Textarea, useToast, VStack } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { cloneDeep, isEmpty } from "lodash"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import { Dashboard } from "types/dashboard"
import { globalTeamId, Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { isJSON } from "utils/is"

const newTitle = "new dashboard"
const ImportDashboard = () => {
    const toast = useToast()
    const router = useRouter()
    const [meta, setMeta] = useState(null)
    const [dashboard, setDashboard] = useState<Dashboard>(null)
    const [teams, setTeams] = useState<Team[]>([])

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("teams/all")
        setTeams(res.data)
    }

    const importDashboard = async () => {
        const res = await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard imported, redirecting...",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            router.push(`/${res.data}`)
        }, 1000)
    }

    const onMetaChange = (meta) => {
        if (!isJSON(meta)) {
            toast({
                title: "Meta json is not valid",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const dash:Dashboard = JSON.parse(meta)
        if (isEmpty(dash.id) || isEmpty(dash.data)) {
            toast({
                title: "Meta json is not valid",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        
        delete dash.id 
        delete dash.ownedBy
        dash.ownedBy = globalTeamId
        setDashboard(dash)
    }

    return <>
        <Page title={`New`} subTitle="Create some useful items" icon={<FaPlus />} tabs={newLinks}>
            <VStack alignItems="left" spacing={4}>
                <InputGroup>
                    <InputLeftAddon children='Meta json' />
                    <Textarea rows={8} onBlur={e => onMetaChange(e.currentTarget.value)}></Textarea>
                </InputGroup>
                {dashboard && <InputGroup>
                    <InputLeftAddon children='Belongs to team' />
                    <Box sx={{
                        '.chakra-select': {
                            paddingLeft: '15px'
                        }
                    }}>
                        <Select value={dashboard.ownedBy} variant="flushed" onChange={e => setDashboard({ ...dashboard, ownedBy: Number(e.currentTarget.value) })}>
                            {teams.map(team => <option key={team.id} value={team.id}>
                                <Text>{team.name}</Text>
                            </option>)}
                        </Select>
                    </Box>
                </InputGroup>}
                <Button width="fit-content" onClick={importDashboard} >Import</Button>
            </VStack>
        </Page>
    </>
}


export default ImportDashboard