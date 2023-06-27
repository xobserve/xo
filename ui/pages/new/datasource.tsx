import { Box, Button, HStack, Image, Input, InputGroup, InputLeftAddon, Select, Text, useToast, VStack } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { isEmpty } from "lodash"
import { useRouter } from "next/router"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import { testHttpConnection } from "src/views/dashboard/plugins/datasource/http/query_runner"
import { testJaegerConnection } from "src/views/dashboard/plugins/datasource/jaeger/query_runner"
import { testPrometheusConnection } from "src/views/dashboard/plugins/datasource/prometheus/query_runner"
import DatasourceEditor from "src/views/datasource/Editor"
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
