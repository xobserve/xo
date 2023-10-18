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
import { Box, Button, Divider, HStack, Image, Input, Select, Text, useToast } from "@chakra-ui/react"
import { isEmpty, upperFirst } from "lodash"
import { Datasource } from "types/datasource"
import { useImmer } from "use-immer"
import { requestApi } from "utils/axios/request"
import FormItem from "src/components/form/Item"
import React, { useState } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, newMsg } from "src/i18n/locales/en"
import { $teams } from "../team/store"
import { useSearchParam } from "react-use"
import { FormSection } from "components/form/Form"
import { externalDatasourcePlugins } from "../dashboard/plugins/external/plugins"
import { builtinDatasourcePlugins } from "../dashboard/plugins/built-in/plugins"
import { isPluginDisabled } from "utils/plugins"

interface Props {
    ds: Datasource
    onChange?: any
    teamEditable?: boolean
}

const DatasourceEditor = ({ ds, onChange = null, teamEditable = true }: Props) => {
    const t = useStore(commonMsg)
    const t1 = useStore(newMsg)
    const toast = useToast()
    const [datasource, setDatasource] = useImmer<Datasource>(ds)
    const [teamId, setTeamId] = useState(useSearchParam('teamId') ?? (ds.teamId))
    const teams = useStore($teams)


    const plugin = builtinDatasourcePlugins[datasource.type] ?? externalDatasourcePlugins[datasource.type]
    const isExternalPlugin = isEmpty(builtinDatasourcePlugins[datasource.type])
    const EditorPlugin = plugin && plugin.datasourceEditor

    const saveDatasource = async () => {
        await requestApi.post("/datasource/save", { ...datasource, teamId: Number(teamId) })
        toast({
            title: ds.id == 0 ? t1.dsToast : t.isUpdated({ name: t.datasource }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        if (ds.id == 0) {
            setTimeout(() => {
                location.href = (`/cfg/team/${teamId}/datasources`)
            }, 1000)
        } else {
            onChange()
        }
    }

    const testDatasource = async () => {
        if (isEmpty(datasource.name)) {
            toast({
                title: t.isInvalid({ name: t.name }),
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        let passed = false;

        if (plugin && plugin.testDatasource) {
            passed = await plugin.testDatasource(datasource)
        }


        if (passed === true) {
            saveDatasource()
            return
        }

        toast({
            title: t1.testDsFailed,
            description: passed,
            status: "warning",
            duration: 3000,
            isClosable: true,
        })
    }


    return (<Box sx={{
        ".form-item-label": {
            width: "120px"
        }
    }}>
        <FormSection>
            <FormItem title={t.name}>
                <Input value={datasource.name} placeholder={t.itemName({ name: t.datasource })} onChange={e => {
                    const v = e.currentTarget.value
                    setDatasource((d: Datasource) => { d.name = v })
                }} />
            </FormItem>
            <FormItem title={t.type}>
                <HStack>
                    <Select width="fit-content" value={datasource.type} onChange={e => {
                        const v = e.currentTarget.value
                        setDatasource((d: Datasource) => { d.type = v as any; d.url = null })
                    }} disabled={!teamEditable}>
                        {Object.keys(builtinDatasourcePlugins).map(dsType => {
                            const p = builtinDatasourcePlugins[dsType]
                            if (isPluginDisabled(p)) {
                                return <></>
                            }
                    
                            return <option key={dsType} value={dsType}>{upperFirst(dsType)}</option>
                        })}
                        <Divider />
                        {Object.keys(externalDatasourcePlugins).map(dsType => {
                             const p = externalDatasourcePlugins[dsType]
                             if (isPluginDisabled(p)) {
                                return <></>
                            }

                            return <option key={dsType} value={dsType}>{upperFirst(dsType)}</option>
                        })}
                    </Select>
                    <Image width="30px" height="30px" src={plugin?.settings.icon} />
                    {isExternalPlugin && <Text textStyle="annotation">{t.external}</Text>}
                </HStack>
            </FormItem>
            <FormItem title={t1.belongTeam}>
                <Box sx={{
                    '.chakra-select': {
                        paddingLeft: '15px'
                    }
                }}>
                    <Select disabled={!teamEditable} value={teamId} variant="flushed" onChange={e => setTeamId(e.currentTarget.value)}>
                        {teams.map(team => <option key={team.id} value={team.id}>
                            <Text>{team.name}</Text>
                        </option>)}
                    </Select>
                </Box>
            </FormItem>
            {EditorPlugin && <EditorPlugin datasource={datasource} onChange={setDatasource} />}
            <Button onClick={testDatasource} size="sm" mt="4">{t.test} & {t.save}</Button>
        </FormSection>
    </Box>)
}

export default DatasourceEditor