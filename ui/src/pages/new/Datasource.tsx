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
import { FormSection } from "src/components/form/Form"
import Page from "layouts/page/Page"
import { FaPlus } from "react-icons/fa"
import { newLinks } from "src/data/nav-links"
import DatasourceEditor from "src/views/datasource/Editor"
import {  DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { commonMsg, newMsg } from "src/i18n/locales/en"
import { useStore } from "@nanostores/react"
import { globalTeamId } from "types/teams"

const initDatasource: Datasource = {
    id: 0,
    name: '',
    url: null,
    type: DatasourceType.Prometheus,
    teamId: globalTeamId
}

const NewDatasourcePage = () => {
    const t = useStore(commonMsg)
    const t1 = useStore(newMsg)
    return <>
        <Page title={t.new} subTitle={t1.subTitle} icon={<FaPlus />} tabs={newLinks}>
            <FormSection maxW="500px" title={t1.dsInfo}>
                <DatasourceEditor ds={initDatasource} />
            </FormSection>
        </Page>
    </>
}


export default NewDatasourcePage
