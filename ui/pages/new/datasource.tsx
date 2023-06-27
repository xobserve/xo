import { Box} from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import DatasourceEditor from "src/views/datasource/Editor"
import {  DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"


const initDatasource: Datasource = {
    id: 0,
    name: '',
    url: '',
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
