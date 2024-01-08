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

import {
  Box,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Flex,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReserveUrls from 'src/data/reserve-urls'
import { commonMsg } from 'src/i18n/locales/en'
import { Dashboard } from 'types/dashboard'
import { Team } from 'types/teams'
import { requestApi } from 'utils/axios/request'
import Loading from 'src/components/loading/Loading'
import { navigateTo } from 'utils/url'
import TemplateList from 'src/views/template/TemplateList'
import { TemplateScope } from 'types/template'

const TeamTemplates = ({ team }: { team: Team }) => {
  const t = useStore(commonMsg)

  const teamId = useParams().teamId
  const [dashboards, setDashboards] = useState<Dashboard[]>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res1 = await requestApi.get(`/dashboard/team/${team.id}`)
    setDashboards(res1.data)
  }

  return (
    <>
      <TemplateList scopeId={team.id} scopeType={TemplateScope.Team} />
    </>
  )
}

export default TeamTemplates
