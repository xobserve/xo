import React from "react"
import { Box, Button,  Select, Text, Textarea, useToast, VStack } from "@chakra-ui/react"
import FormItem from "components/form/Item"
import Page from "layouts/page/Page"
import { isEmpty } from "lodash"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import { Dashboard } from "types/dashboard"
import { globalTeamId, Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { isJSON } from "utils/is"

const ImportDashboard = () => {
    const toast = useToast()
    const router = useRouter()
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
                <FormItem title='Meta json'>
                    <Textarea rows={8} onBlur={e => onMetaChange(e.currentTarget.value)}></Textarea>
                </FormItem>
                {dashboard && <FormItem title='Belongs to team' >
                    <Box sx={{
                        '.chakra-select': {
                            paddingLeft: '15px'
                        }
                    }}>
                        <Select size="sm" value={dashboard.ownedBy} variant="flushed" onChange={e => setDashboard({ ...dashboard, ownedBy: Number(e.currentTarget.value) })}>
                            {teams.map(team => <option key={team.id} value={team.id}>
                                <Text>{team.name}</Text>
                            </option>)}
                        </Select>
                    </Box>
                </FormItem>}
                <Button width="fit-content" onClick={importDashboard} size="sm">Import</Button>
            </VStack>
        </Page>
    </>
}


export default ImportDashboard