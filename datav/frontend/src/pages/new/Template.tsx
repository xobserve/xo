// Copyright 2023 xobserve.io Team
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

import React from 'react'
import Page from 'layouts/page/Page'
import { FaPlus } from 'react-icons/fa'
import { commonMsg, newMsg } from 'src/i18n/locales/en'
import { useStore } from '@nanostores/react'
import { useParams } from 'react-router-dom'
import { getNewLinks } from './links'
import TemplateEditor from 'src/views/template/TemplateEditor'

const NewTemplatePage = () => {
  const t = useStore(commonMsg)
  const t1 = useStore(newMsg)

  const teamId = useParams().teamId
  const newLinks = getNewLinks(teamId)

  return (
    <>
      <Page
        title={t.new}
        subTitle={t1.subTitle}
        icon={<FaPlus />}
        tabs={newLinks}
      >
        <TemplateEditor />
      </Page>
    </>
  )
}

export default NewTemplatePage
