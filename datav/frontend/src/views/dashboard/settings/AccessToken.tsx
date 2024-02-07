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
import AccessTokenManage from 'src/views/accesstoken/AccessTokenManage'
import { Dashboard } from 'types/dashboard'
import { Scope } from 'types/scope'

interface Props {
  dashboard: Dashboard
  onChange: any
}

const DashboardAccessToken = ({ dashboard, onChange }: Props) => {
  return (
    <AccessTokenManage
      scope={Scope.Dashboard}
      scopeId={dashboard.ownedBy + ':' + dashboard.id}
    />
  )
}

export default DashboardAccessToken
