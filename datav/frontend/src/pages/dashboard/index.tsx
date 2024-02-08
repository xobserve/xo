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

import React, { memo } from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DashboardWrapper from 'src/views/dashboard/Dashboard'
import NotFoundPage from '../NotFound'
import { $config, URL_ROOT_PATH } from 'src/data/configs/config'
import { Box } from '@chakra-ui/react'
import Loading from 'components/loading/Loading'
import { Dashboard } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import { $teams } from 'src/views/team/store'
import { $datasources } from 'src/views/datasource/store'
import { initVariableSelected } from 'src/views/variables/Loader'
import { $variables } from 'src/views/variables/store'
import { getNavigateTo, navigateTo } from 'utils/url'
import { replaceDashboardTemplatePanels } from 'utils/template'
import { useStore } from '@nanostores/react'
import { $accessToken } from 'src/views/accesstoken/store'

interface Props {
  dashboard?: Dashboard
  sideWidth: number
}

const DashboardPageWrapper = memo(({ sideWidth }: Props) => {
  const teamId0 = Number(useParams().teamId)
  const teamId = isNaN(teamId0) ? 0 : teamId0
  let path = location.pathname.replace(`/${teamId}`, '')
  path = path.replace(URL_ROOT_PATH, '')
  const [dashboard, setDashboard] = useState<Dashboard>(null)
  const [error, setError] = useState<any>(null)
  const accessToken = useStore($accessToken)

  useEffect(() => {
    setDashboard(null)
    loadConfig(path)
  }, [location.pathname])

  const loadConfig = async (path) => {
    try {
      const res = await requestApi.get(
        `/config/dashboard?teamId=${teamId}&path=${path}&accessToken=${
          accessToken ?? ''
        }`,
      )
      if (res.data.reload && res.data.path != path) {
        window.location.href = getNavigateTo(res.data.path)
        return
      }
      const cfg = res.data.cfg
      cfg.sidemenu = (cfg.sidemenu as any)?.data
        .flat()
        .filter((item) => !item.hidden)
      $config.set(cfg)
      if (!res.data.dashboard) {
        setError('Dashboard not found')
        return
      }
      $teams.set(res.data.teams)
      $datasources.set(res.data.datasources)
      initVariableSelected(res.data.variables)
      $variables.set(res.data.variables)

      // get panel templates content
      const dash: Dashboard = res.data.dashboard
      await replaceDashboardTemplatePanels(dash)
      setDashboard(dash)
      if (res.data.path != path) {
        navigateTo(`/` + res.data.cfg.currentTeam + res.data.path)
      }
    } catch (error) {
      setError(error)
    }
  }

  return (
    <>
      {dashboard && (
        <DashboardWrapper
          key={location.pathname}
          sideWidth={sideWidth}
          rawDashboard={dashboard}
        />
      )}
      {error && (
        <NotFoundPage
          message={typeof error == 'string' ? error : error?.message}
        />
      )}
      {!dashboard && !error && (
        <Box position='fixed' top='50vh' left='50vw'>
          <Loading />
        </Box>
      )}
    </>
  )
})

export default DashboardPageWrapper
