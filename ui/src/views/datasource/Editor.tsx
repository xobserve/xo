import {  Button, HStack, Image, Input, Select, useToast } from "@chakra-ui/react"
import { isEmpty } from "lodash"
import { useRouter } from "next/router"
import { checkAndTestHttp } from "src/views/dashboard/plugins/datasource/http/query_runner"
import { checkAndTestJaeger } from "src/views/dashboard/plugins/datasource/jaeger/query_runner"
import { checkAndTestPrometheus } from "src/views/dashboard/plugins/datasource/prometheus/query_runner"
import {  DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { useImmer } from "use-immer"
import { requestApi } from "utils/axios/request"
import HttpDatasourceEditor from "../dashboard/plugins/datasource/http/DatasourceEditor"
import PrometheusDatasourceEditor from "../dashboard/plugins/datasource/prometheus/DatasourceEditor"
import TestDataDatasourceEditor from "../dashboard/plugins/datasource/testdata/DatasourceEditor"
import JaegerDatasourceEditor from "../dashboard/plugins/datasource/jaeger/DatasourceEditor"
import FormItem from "components/form/Item"
import React from "react";

const DatasourceEditor = ({ds, onChange=null}) => {
    const toast = useToast()
    const router = useRouter()
    const [datasource, setDatasource] = useImmer<Datasource>(ds)

    const saveDatasource = async () => {
        const res = await requestApi.post("/datasource/save", datasource)
        toast({
            title: ds.id == 0 ? "Datasource added, redirecting..." : "Datasource updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        if (ds.id == 0) {
            setTimeout(() => {
                router.push(`/cfg/datasources?id=${res.data}`)
            }, 1000)
        } else {
            onChange()
        }
    }

    const testDatasource = async () => {
        if (isEmpty(datasource.name)) {
            toast({
                title: "Invalid name",
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
            case DatasourceType.TestData:
                passed = true
                break
            default:
                passed = false
                break
        }

        if (passed === true) {
            saveDatasource()
            return
        }

        toast({
            title: "Test failed",
            description: passed,
            status: "warning",
            duration: 3000,
            isClosable: true,
        })
    }

    return (<>
        <FormItem title="Name">
            <Input value={datasource.name} placeholder="datasource name" onChange={e => {
                const v = e.currentTarget.value
                setDatasource((d: Datasource) => { d.name = v })
            }} />
        </FormItem>
        <FormItem title="Type">
            <HStack>
                <Select width="fit-content" value={datasource.type} onChange={e => {
                    const v = e.currentTarget.value
                    setDatasource((d: Datasource) => { d.type = v as any })
                }}>
                    {Object.keys(DatasourceType).map((key, index) => {
                        return <option key={index} value={DatasourceType[key]}>{key}</option>
                    })}
                </Select>
                <Image width="30px" height="30px" src={`/plugins/datasource/${datasource.type}.svg`} />
            </HStack>
        </FormItem>
        {/* @needs-update-when-add-new-datasource */}
        {datasource.type == DatasourceType.ExternalHttp && <HttpDatasourceEditor datasource={datasource} onChange={setDatasource}/>}
        {datasource.type == DatasourceType.Prometheus && <PrometheusDatasourceEditor datasource={datasource} onChange={setDatasource}/>}
        {datasource.type == DatasourceType.TestData && <TestDataDatasourceEditor datasource={datasource} onChange={setDatasource}/>}
        {datasource.type == DatasourceType.Jaeger && <JaegerDatasourceEditor datasource={datasource} onChange={setDatasource}/>}
        <Button onClick={testDatasource} size="sm" mt="4">Test & Save</Button>
    </>)
}

export default DatasourceEditor