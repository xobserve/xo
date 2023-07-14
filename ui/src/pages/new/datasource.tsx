import React from "react"
import { FormSection } from "components/form/Form"
import Page from "layouts/page/Page"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import DatasourceEditor from "src/views/datasource/Editor"
import {  DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { commonMsg, newMsg } from "src/i18n/locales/en"
import { useStore } from "@nanostores/react"

const initDatasource: Datasource = {
    id: 0,
    name: '',
    url: '',
    type: DatasourceType.Prometheus
}

const NewDatasourcePage = () => {
    const t = useStore(commonMsg)
    const t1 = useStore(newMsg)
    return <>
        <Page title={t.new} subTitle={t1.subTitle} icon={<FaPlus />} tabs={newLinks}>
            <FormSection maxW="500px" title="Datasource info">
                <DatasourceEditor ds={initDatasource} />
            </FormSection>
        </Page>
    </>
}


export default NewDatasourcePage
