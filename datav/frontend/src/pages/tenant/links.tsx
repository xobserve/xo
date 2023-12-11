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
import { FaCog, FaUserCog, FaUsers } from 'react-icons/fa'
import { getNavigateTo } from 'utils/url'
import { isEmpty } from 'utils/validate'
export const getTenantLinks = (teamId) => {
  let teamPath = ''
  if (!isEmpty(teamId)) {
    teamPath = `/${teamId}`
  }

  return [
    {
      title: 'members',
      url: getNavigateTo(`${teamPath}/tenant/users`),
      baseUrl: getNavigateTo(`${teamPath}/tenant/users`),
      icon: <FaUserCog />,
    },
    {
      title: 'team',
      url: getNavigateTo(`${teamPath}/tenant/teams`),
      baseUrl: getNavigateTo(`${teamPath}/tenant/teams`),
      icon: <FaUsers />,
    },
    {
      title: 'settings',
      url: getNavigateTo(`${teamPath}/tenant/setting`),
      baseUrl: getNavigateTo(`${teamPath}/tenant/setting`),
      icon: <FaCog />,
    },
  ]
}
