// Copyright 2023 xObserve.io Team
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

import React from "react";
import Login from "src/pages/Login";
import NotFoundPage from "src/pages/NotFound";
import AccountSetting from "src/pages/account/Setting";
import NewDashboardPage from "pages/new/Dashboard";
import NewDatasourcePage from "src/pages/new/Datasource";
import ImportDashboardPage from "src/pages/new/Import";
import TeamsPage from "pages/admin/TenantTeams";
import TeamDashboardsPage from "src/pages/cfg/team/Dashboards";
import TeamMembersPage from "src/pages/cfg/team/Members";
import TeamSettingPage from "src/pages/cfg/team/Setting";
import TeamSidemenuPage from "src/pages/cfg/team/Sidemenu";
import TestPage from "src/pages/Test";
import loadable from '@loadable/component';
import PageContainer from "layouts/PageContainer";
import AdminPage from "src/pages/admin/AuditLogs";
import GithubLogin from "src/pages/GithubLogin";
import AdminTenants from "pages/admin/Tenants";
import TeamLayout from "src/pages/cfg/team/components/Layout";
import AdminUsers from "pages/admin/Users";
import TeamDatasources from "pages/cfg/team/Datasources";
import TeamVariablesPage from "pages/cfg/team/Variables";
import IframeExamplesPage from "pages/examples/Iframe";
import AdminTenantUsers from "pages/admin/TenantUsers";
import TenantSetting from "pages/admin/TenantSetting";


const DashboardPage = loadable(() => import('src/pages/dashboard/index'));
const TracePage = loadable(() => import('src/pages/dashboard/Trace'));

const pageContainer = ele => {
  return <PageContainer>{ele}</PageContainer>
}

const teamPageContainer = ele => {
  return <TeamLayout>{ele}</TeamLayout>
}


export const getRoutes = (enableTenant=false) => {
  let teamId = ''
  if (enableTenant) {
     teamId = `/:teamId`
  }

  const cfgRoutes = [
    {
      path: `${teamId}/cfg/team/datasources`,
      //@ts-ignore
      element: pageContainer(teamPageContainer(<TeamDatasources />)),
    },
    {
      path: `${teamId}/cfg/team/variables`,
      //@ts-ignore
      element: pageContainer(teamPageContainer(<TeamVariablesPage />)),
    },
    {
      path: `${teamId}/cfg/team/dashboards`,
      //@ts-ignore
      element: pageContainer(teamPageContainer(<TeamDashboardsPage />)),
    },
    {
      path: `${teamId}/cfg/team/members`,
      //@ts-ignore
      element: pageContainer(teamPageContainer(<TeamMembersPage />)),
    },
    {
      path: `${teamId}/cfg/team/setting`,
      //@ts-ignore
      element: pageContainer(teamPageContainer(<TeamSettingPage />)),
    },
    {
      path: `${teamId}/cfg/team/sidemenu`,
      //@ts-ignore
      element: pageContainer(teamPageContainer(<TeamSidemenuPage />)),
    },
  ]

  const newRoutes = [
    {
      path: `${teamId}/new/dashboard`,
      element: pageContainer(<NewDashboardPage />),
    },
    {
      path: `${teamId}/new/datasource`,
      element: pageContainer(<NewDatasourcePage />),
    },
    {
      path: `${teamId}/new/import`,
      element: pageContainer(<ImportDashboardPage />),
    },
  ]

  const adminRoutes = [
    {
      path: `${teamId}/admin/audit`,
      element: pageContainer(<AdminPage />),
    },
    {
      path: `${teamId}/admin/tenants`,
      element: pageContainer(<AdminTenants />),
    },
    {
      path: `${teamId}/admin/users`,
      element: pageContainer(<AdminUsers />),
    },
    {
      path: `${teamId}/admin/tenant/users`,
      element: pageContainer(<AdminTenantUsers />),
    },
    {
      path: `${teamId}/admin/tenant/teams`,
      element: pageContainer(<TeamsPage />),
    },
    {
      path: `${teamId}/admin/tenant/setting`,
      element: pageContainer(<TenantSetting />),
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
      element: pageContainer(<AccountSetting />),
    },
    ...newRoutes,
    ...cfgRoutes,
    ...adminRoutes,
    {
      path: `${teamId}/*`,
      element: pageContainer(<DashboardPage />),
    },
    {
      path: `/`,
      element: pageContainer(<DashboardPage />),
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
    {
      path: `${teamId}/trace/:id/:datasourceId`,
      element: <TracePage />,
    },
    {
      path: `${teamId}/test`,
      element: <TestPage />
    },
    {
      path: `${teamId}/examples/iframe`,
      element: <IframeExamplesPage />
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/login/github",
      element: <GithubLogin />,
    },
  ]
}

