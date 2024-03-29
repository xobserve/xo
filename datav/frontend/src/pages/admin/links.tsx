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
import { FaProjectDiagram, FaUser, FaUserCog } from 'react-icons/fa'
import { MdOutlineAdminPanelSettings } from 'react-icons/md'
import { getNavigateTo } from 'utils/url'

export const getAdminLinks = () => {
  return [
    {
      title: 'auditLog',
      url: getNavigateTo(`/admin/audit`),
      baseUrl: getNavigateTo(`/admin/audit`),
      icon: <MdOutlineAdminPanelSettings />,
    },
    {
      title: 'tenant',
      url: getNavigateTo(`/admin/tenants`),
      baseUrl: getNavigateTo(`/admin/tenants`),
      icon: <FaUser />,
    },
    {
      title: 'user',
      url: getNavigateTo(`/admin/users`),
      baseUrl: getNavigateTo(`/admin/users`),
      icon: <FaUserCog />,
    },
    {
      title: 'template',
      url: getNavigateTo(`/admin/templates`),
      baseUrl: getNavigateTo(`/admin/templates`),
      icon: <FaProjectDiagram />,
    },
    {
      title: 'accessToken',
      url: getNavigateTo(`/admin/accesstoken`),
      baseUrl: getNavigateTo(`/admin/accesstoken`),
      icon: <FaProjectDiagram />,
    },
  ]
}
