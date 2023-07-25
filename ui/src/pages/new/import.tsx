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

import React from "react"
import { Box, Button,  Select, Text, Textarea, useToast, VStack } from "@chakra-ui/react"
import FormItem from "components/form/Item"
import Page from "layouts/page/Page"
import { isEmpty } from "lodash"
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import { Dashboard } from "types/dashboard"
import { globalTeamId, Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { isJSON } from "utils/is"
import { useNavigate } from "react-router-dom"
import { commonMsg, newMsg } from "src/i18n/locales/en"
import { useStore } from "@nanostores/react"

const ImportDashboardPage = () => {
    const t = useStore(commonMsg)
    const t1 = useStore(newMsg)
    const toast = useToast()
    const navigate = useNavigate()
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
        const res = await requestApi.post("/dashboard/save", {dashboard,changes: "Imported from json"})
        toast({
            title: t1.importToast,
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            navigate(`/${res.data}`)
        }, 1000)
    }

    const onMetaChange = (meta) => {
        if (!isJSON(meta)) {
            toast({
                title: t1.jsonInvalid,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const dash:Dashboard = JSON.parse(meta)
        if (isEmpty(dash.id) || isEmpty(dash.data)) {
            toast({
                title: t1.jsonInvalid,
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
        <Page title={t.new} subTitle={t1.subTitle} icon={<FaPlus />} tabs={newLinks}>
            <VStack alignItems="left" spacing={4}>
                <FormItem title='Meta json'>
                    <Textarea rows={8} onBlur={e => onMetaChange(e.currentTarget.value)}></Textarea>
                </FormItem>
                {dashboard && <FormItem title={t1.belongTeam}>
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
                <Button width="fit-content" onClick={importDashboard} size="sm">{t.submit}</Button>
            </VStack>
        </Page>
    </>
}


export default ImportDashboardPage