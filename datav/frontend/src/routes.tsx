// Copyright 2023 xObserve.io Team

import React from 'react'
import Login from 'src/pages/Login'
import NotFoundPage from 'src/pages/NotFound'
import AccountSetting from 'src/pages/account/Setting'
import NewDashboardPage from 'pages/new/Dashboard'
import NewDatasourcePage from 'src/pages/new/Datasource'
import ImportDashboardPage from 'src/pages/new/Import'
import TeamsPage from 'pages/tenant/TenantTeams'
import TeamDashboardsPage from 'src/pages/cfg/team/Dashboards'
import TeamMembersPage from 'src/pages/cfg/team/Members'
import TeamSettingPage from 'src/pages/cfg/team/Setting'
import TeamSidemenuPage from 'src/pages/cfg/team/Sidemenu'
import TestPage from 'src/pages/Test'
import loadable from '@loadable/component'
import PageContainer from 'layouts/PageContainer'
import AdminPage from 'src/pages/admin/AuditLogs'
import GithubLogin from 'src/pages/GithubLogin'
import AdminTenants from 'pages/admin/Tenants'
import TeamLayout from 'src/pages/cfg/team/components/Layout'
import AdminUsers from 'pages/admin/Users'
import TeamDatasources from 'pages/cfg/team/Datasources'
import TeamVariablesPage from 'pages/cfg/team/Variables'
import IframeExamplesPage from 'pages/examples/Iframe'
import AdminTenantUsers from 'pages/tenant/TenantUsers'
import TenantSetting from 'pages/tenant/TenantSetting'
import CommonConfig from './components/configloader/CommonConfig'
import BasicConfig from 'components/configloader/BasicConfig'
import { URL_ROOT_PATH } from './data/configs/config'
import { getNavigateTo } from 'utils/url'
import TemplateMarket from 'pages/template'
import NewTemplatePage from 'pages/new/Template'
import TeamTemplates from 'pages/cfg/team/Templates'

const DashboardPage = loadable(() => import('src/pages/dashboard/index'))
const TracePage = loadable(() => import('src/pages/dashboard/Trace'))

const commonConfig = (ele) => {
  return <CommonConfig>{ele}</CommonConfig>
}

const pageContainer = (ele) => {
  return <PageContainer>{ele}</PageContainer>
}

const teamPageContainer = (ele) => {
  return <TeamLayout>{ele}</TeamLayout>
}

export const getRoutes = (enableTenant = false) => {
  let teamId = ''
  if (enableTenant) {
    teamId = getNavigateTo(`/:teamId`)
  }

  const cfgRoutes = [
    {
      path: `${teamId}/cfg/team/datasources`,

      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamDatasources />)),
      ),
    },
    {
      path: `${teamId}/cfg/team/variables`,
      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamVariablesPage />)),
      ),
    },
    {
      path: `${teamId}/cfg/team/dashboards`,
      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamDashboardsPage />)),
      ),
    },
    {
      path: `${teamId}/cfg/team/members`,
      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamMembersPage />)),
      ),
    },
    {
      path: `${teamId}/cfg/team/templates`,
      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamTemplates />)),
      ),
    },
    {
      path: `${teamId}/cfg/team/setting`,
      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamSettingPage />)),
      ),
    },
    {
      path: `${teamId}/cfg/team/sidemenu`,
      element: commonConfig(
        //@ts-ignore
        pageContainer(teamPageContainer(<TeamSidemenuPage />)),
      ),
    },
  ]

  const newRoutes = [
    {
      path: `${teamId}/new/dashboard`,
      element: commonConfig(pageContainer(<NewDashboardPage />)),
    },
    {
      path: `${teamId}/new/datasource`,
      element: commonConfig(pageContainer(<NewDatasourcePage />)),
    },
    {
      path: `${teamId}/new/import`,
      element: commonConfig(pageContainer(<ImportDashboardPage />)),
    },
    {
      path: `${teamId}/new/template`,
      element: commonConfig(pageContainer(<NewTemplatePage />)),
    },
  ]

  const adminRoutes = [
    {
      path: `${URL_ROOT_PATH}/admin/audit`,
      element: commonConfig(<AdminPage />),
    },
    {
      path: `${URL_ROOT_PATH}/admin/tenants`,
      element: commonConfig(<AdminTenants />),
    },
    {
      path: `${URL_ROOT_PATH}/admin/users`,
      element: commonConfig(<AdminUsers />),
    },
  ]

  const tenantRoutes = [
    {
      path: `${teamId}/tenant/users`,
      element: commonConfig(pageContainer(<AdminTenantUsers />)),
    },
    {
      path: `${teamId}/tenant/teams`,
      element: commonConfig(pageContainer(<TeamsPage />)),
    },
    {
      path: `${teamId}/tenant/setting`,
      element: commonConfig(pageContainer(<TenantSetting />)),
    },
  ]

  const templateRoutes = [
    {
      path: `${teamId}/template`,
      element: commonConfig(pageContainer(<TemplateMarket />)),
    },
  ]

  return [
    // {
    //   path: "/",
    //   Component: () => {
    //     return <div><Navigate replace to="/home"/></div>
    //   }
    // },
    {
      path: `${teamId}/account/setting`,
      element: commonConfig(pageContainer(<AccountSetting />)),
    },
    ...newRoutes,
    ...cfgRoutes,
    ...adminRoutes,
    ...tenantRoutes,
    ...templateRoutes,
    {
      path: `${teamId}/*`,
      element: pageContainer(<DashboardPage />),
    },
    {
      path: `/${URL_ROOT_PATH}`,
      element: pageContainer(<DashboardPage />),
    },
    {
      path: `/`,
      element: pageContainer(<DashboardPage />),
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
    {
      path: `${teamId}/trace/:id/:datasourceId`,
      element: commonConfig(<TracePage />),
    },
    {
      path: `${teamId}/test`,
      element: <TestPage />,
    },
    {
      path: `${teamId}/examples/iframe`,
      element: <IframeExamplesPage />,
    },
    {
      path: `/${URL_ROOT_PATH}/login`,
      element: (
        <BasicConfig>
          <Login />
        </BasicConfig>
      ),
    },
    {
      path: `${URL_ROOT_PATH}/login/github`,
      element: (
        <BasicConfig>
          <GithubLogin />
        </BasicConfig>
      ),
    },
  ]
}
