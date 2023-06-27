import { Box, Button, HStack, Image, Input, InputGroup, InputLeftAddon, Select, Text, useToast, VStack } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { isEmpty } from "lodash"
import { useRouter } from "next/router"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import { testHttpConnection } from "src/views/dashboard/plugins/datasource/http/query_runner"
import { testJaegerConnection } from "src/views/dashboard/plugins/datasource/jaeger/query_runner"
import { testPrometheusConnection } from "src/views/dashboard/plugins/datasource/prometheus/query_runner"
import {  DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { useImmer } from "use-immer"
import { requestApi } from "utils/axios/request"
import isURL from "validator/lib/isURL"


const initDatasource: Datasource = {
    id: 0,
    name: '',
    url: 'http://localhost:9090',
    type: DatasourceType.Prometheus
}

const DatasourcePage = () => {
    return <>
        <Page title={`New`} subTitle="Create some useful items" icon={<FaPlus />} tabs={newLinks}>
            <Box alignItems="left" maxW="500px">
                <Box mb="2" textStyle="subTitle">Datasource info</Box>
                <DatasourceEditor ds={initDatasource} />
            </Box>
        </Page>
    </>
}


export default DatasourcePage

export const DatasourceEditor = ({ds}) => {
    const toast = useToast()
    const router = useRouter()
    const [datasource, setDatasource] = useImmer<Datasource>(ds)

    const addDatasource = async () => {
        const res = await requestApi.post("/datasource/save", datasource)
        toast({
            title: "Datasource added, redirecting...",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            router.push(`/cfg/datasources?id=${res.data}`)
        }, 1000)
    }

    const testDatasource = async () => {
        if (!isURL(datasource.url, { require_tld: false })) {
            toast({
                title: "Invalid url",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }

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
                passed = await testPrometheusConnection(datasource.url)
                break
            case DatasourceType.ExternalHttp:
                passed = await testHttpConnection(datasource.url)
                break
            case DatasourceType.Jaeger:
                passed = await testJaegerConnection(datasource.url)
                break
            case DatasourceType.TestData:
                passed = true
                break
            default:
                passed = false
                break
        }

        if (passed === true) {
            addDatasource()
            // toast({
            //     title: "Test passed",
            //     status: "success",
            //     duration: 3000,
            //     isClosable: true,
            // })
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
        <InputGroup size="sm">
            <InputLeftAddon children='Name' />
            <Input value={datasource.name} placeholder="datasource name" onChange={e => {
                const v = e.currentTarget.value
                setDatasource((d: Datasource) => { d.name = v })
            }} />
        </InputGroup>
        <InputGroup size="sm" mt="4">
            <InputLeftAddon children='Type' />
            <HStack>
                <Select width="fit-content" size="sm" value={datasource.type} onChange={e => {
                    const v = e.currentTarget.value
                    setDatasource((d: Datasource) => { d.type = v as any })
                }}>
                    {Object.keys(DatasourceType).map((key, index) => {
                        return <option key={index} value={DatasourceType[key]}>{key}</option>
                    })}
                </Select>
                <Image width="30px" height="30px" src={`/plugins/datasource/${datasource.type}.svg`} />
            </HStack>
        </InputGroup>
        <InputGroup size="sm" mt="4">
            <InputLeftAddon children='URL' />
            <Input value={datasource.url} placeholder="http://localhost:9090" onChange={e => {
                const v = e.currentTarget.value
                setDatasource((d: Datasource) => { d.url = v })
            }} />
        </InputGroup>
        <Button onClick={testDatasource} size="sm" mt="4">Test & Save</Button>
    </>)
}