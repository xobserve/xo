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
import { checkAndTestHttp } from "src/views/dashboard/plugins/datasource/http/query_runner"
import { checkAndTestJaeger } from "src/views/dashboard/plugins/datasource/jaeger/query_runner"
import { checkAndTestPrometheus } from "src/views/dashboard/plugins/datasource/prometheus/query_runner"
import { DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { useImmer } from "use-immer"
import { requestApi } from "utils/axios/request"
import HttpDatasourceEditor from "../dashboard/plugins/datasource/http/DatasourceEditor"
import PrometheusDatasourceEditor from "../dashboard/plugins/datasource/prometheus/DatasourceEditor"
import TestDataDatasourceEditor from "../dashboard/plugins/datasource/testdata/DatasourceEditor"
import JaegerDatasourceEditor from "../dashboard/plugins/datasource/jaeger/DatasourceEditor"
import FormItem from "src/components/form/Item"
import React, { useState } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, newMsg } from "src/i18n/locales/en"
import { checkAndTestLoki } from "../dashboard/plugins/datasource/loki/query_runner"
import LokiDatasourceEditor from "../dashboard/plugins/datasource/loki/DatasourceEditor"
import { $teams } from "../team/store"
import { useSearchParam } from "react-use"
import { FormSection } from "components/form/Form"
import { externalDatasourcePlugins } from "../dashboard/plugins/externalPlugins"
import externalDsList  from 'public/plugins/external/datasource/plugins.json'

interface Props {
    ds: Datasource
    onChange?: any
    teamEditable?: boolean
}

const DatasourceEditor = ({ ds, onChange = null, teamEditable=true }: Props) => {
    const t = useStore(commonMsg)
    const t1 = useStore(newMsg)
    const toast = useToast()
    const [datasource, setDatasource] = useImmer<Datasource>(ds)
    const [teamId, setTeamId] = useState( useSearchParam('teamId')?? (ds.teamId))
    const teams = useStore($teams)


    const externalDs = externalDatasourcePlugins[datasource.type]
    const dsIcon =  externalDs ? `/plugins/external/datasource/${datasource.type}.svg`  : `/plugins/datasource/${datasource.type}.svg`
    const ExternalEditor = externalDs && externalDs.datasourceEditor

    const saveDatasource = async () => {
        await requestApi.post("/datasource/save", {...datasource,teamId: Number(teamId)})
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

        //@needs-update-when-add-new-datasource
        let passed;
        switch (datasource.type) {
            case DatasourceType.Prometheus:
                passed = await checkAndTestPrometheus(datasource)
                break
            case DatasourceType.ExternalHttp:
                passed = await checkAndTestHttp(datasource)
                break
            case DatasourceType.Jaeger:
                passed = await checkAndTestJaeger(datasource)
                break
            case DatasourceType.Loki:
                passed = await checkAndTestLoki(datasource)
                break
            case DatasourceType.TestData:
                passed = true
                break
            default:
                if (externalDs && externalDs.testDatasource) {
                    passed = await externalDs.testDatasource(datasource)
                    break
                }
                passed = false
                break
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
                        setDatasource((d: Datasource) => { d.type = v as any })
                    }}>
                        {Object.keys(DatasourceType).map((key, index) => {
                            return <option key={index} value={DatasourceType[key]}>{key}</option>
                        })}
                        <Divider />
                        {externalDsList.map(ds => {
                            return <option key={ds.type} value={ds.type}>{upperFirst(ds.type)}</option>
                        })}
                    </Select>
                    <Image width="30px" height="30px" src={dsIcon} />
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
            {/* @needs-update-when-add-new-datasource */}
            {datasource.type == DatasourceType.ExternalHttp && <HttpDatasourceEditor datasource={datasource} onChange={setDatasource} />}
            {datasource.type == DatasourceType.Prometheus && <PrometheusDatasourceEditor datasource={datasource} onChange={setDatasource} />}
            {datasource.type == DatasourceType.TestData && <TestDataDatasourceEditor datasource={datasource} onChange={setDatasource} />}
            {datasource.type == DatasourceType.Jaeger && <JaegerDatasourceEditor datasource={datasource} onChange={setDatasource} />}
            {datasource.type == DatasourceType.Loki && <LokiDatasourceEditor datasource={datasource} onChange={setDatasource} />}
            {ExternalEditor && <ExternalEditor datasource={datasource} onChange={setDatasource} />}
            <Button onClick={testDatasource} size="sm" mt="4">{t.test} & {t.save}</Button>
        </FormSection>
    </Box>)
}

export default DatasourceEditor