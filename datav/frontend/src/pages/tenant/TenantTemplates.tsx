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
import TemplateList from 'src/views/template/TemplateList'
import { useStore } from '@nanostores/react'
import { $config } from 'src/data/configs/config'
import Page from 'layouts/page/Page'
import { locale } from 'src/i18n/i18n'
import { getTenantLinks } from './links'
import { FaUser } from 'react-icons/fa'
import { commonMsg } from 'src/i18n/locales/en'
import { Scope } from 'types/scope'

const TenantTemplates = () => {
  const t = useStore(commonMsg)
  const config = useStore($config)
  const lang = useStore(locale)
  const tenantLinks = getTenantLinks(config.currentTeam)
  return (
    <>
      <Page
        title={
          lang == 'en'
            ? `Tenant Admin - ${config.tenantName}`
            : `租户管理 - ${config.tenantName}`
        }
        subTitle={t.manageItem({ name: t.template })}
        icon={<FaUser />}
        tabs={tenantLinks}
      >
        <TemplateList scopeId={config.currentTenant} scopeType={Scope.Tenant} />
      </Page>
    </>
  )
}

export default TenantTemplates
