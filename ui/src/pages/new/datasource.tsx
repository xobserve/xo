import React from "react"
import { FormSection } from "components/form/Form"
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

const NewDatasourcePage = () => {
    return <>
        <Page title={`New`} subTitle="Create some useful items" icon={<FaPlus />} tabs={newLinks}>
            <FormSection maxW="500px" title="Datasource info">
                <DatasourceEditor ds={initDatasource} />
            </FormSection>
        </Page>
    </>
}


export default NewDatasourcePage
