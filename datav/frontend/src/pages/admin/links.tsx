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
import { FaUser, FaUserCog } from 'react-icons/fa'
import { MdOutlineAdminPanelSettings } from 'react-icons/md'
import { isEmpty } from 'utils/validate'

export const getAdminLinks = (teamId) => {
  let teamPath = ''
  if (!isEmpty(teamId)) {
    teamPath = `/${teamId}`
  }
  return [
    {
      title: 'auditLog',
      url: `/admin/audit`,
      baseUrl: `/admin/audit`,
      icon: <MdOutlineAdminPanelSettings />,
    },
    {
      title: 'tenant',
      url: `/admin/tenants`,
      baseUrl: `/admin/tenants`,
      icon: <FaUser />,
    },
    {
      title: 'user',
      url: `/admin/users`,
      baseUrl: `/admin/users`,
      icon: <FaUserCog />,
    },
  ]
}
