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
import TeamsPage from "pages/cfg/Teams";
import TeamDashboardsPage from "src/pages/cfg/team/[id]/Dashboards";
import TeamMembersPage from "src/pages/cfg/team/[id]/Members";
import TeamSettingPage from "src/pages/cfg/team/[id]/Setting";
import TeamSidemenuPage from "src/pages/cfg/team/[id]/Sidemenu";
import TestPage from "src/pages/Test";
import loadable from '@loadable/component';
import PageContainer from "layouts/PageContainer";
import AdminPage from "src/pages/admin/AuditLogs";
import GithubLogin from "src/pages/GithubLogin";
import  AdminUserStats  from "src/pages/admin/UserStats";
import TeamLayout from "src/pages/cfg/team/[id]/components/Layout";
import AdminUsers from "pages/admin/Users";
import TeamDatasources from "pages/cfg/team/[id]/Datasources";
import TeamVariablesPage from "pages/cfg/team/[id]/Variables";
import IframeExamplesPage from "pages/examples/Iframe";


const DashboardPage = loadable(() => import('src/pages/dashboard/index'));
const TracePage = loadable(() => import('src/pages/dashboard/Trace'));

const pageContainer = ele => {
  return <PageContainer>{ele}</PageContainer>
}

const teamPageContainer = ele => {
  return <TeamLayout>{ele}</TeamLayout>
}

const cfgRoutes = [
  {
    path: "/cfg/teams",
    element: pageContainer(<TeamsPage />),
  },
    {
    path: "/cfg/team/:id/datasources",
    //@ts-ignore
    element: pageContainer(teamPageContainer(<TeamDatasources />)),
  },
  {
    path: "/cfg/team/:id/variables",
    //@ts-ignore
    element: pageContainer(teamPageContainer(<TeamVariablesPage />)),
  },
  {
    path: "/cfg/team/:id/dashboards",
    //@ts-ignore
    element: pageContainer(teamPageContainer(<TeamDashboardsPage />)),
  },
  {
    path: "/cfg/team/:id/members",
    //@ts-ignore
    element: pageContainer(teamPageContainer(<TeamMembersPage />)),
  },
  {
    path: "/cfg/team/:id/setting",
    //@ts-ignore
    element: pageContainer(teamPageContainer(<TeamSettingPage />)),
  },
  {
    path: "/cfg/team/:id/sidemenu",
    //@ts-ignore
    element: pageContainer(teamPageContainer(<TeamSidemenuPage />)),
  },
]

const newRoutes = [
  {
    path: "/new/dashboard",
    element: pageContainer(<NewDashboardPage />),
  },
  {
    path: "/new/datasource",
    element: pageContainer(<NewDatasourcePage />),
  },
  {
    path: "/new/import",
    element: pageContainer(<ImportDashboardPage />),
  },
]

const adminRoutes = [
  {
    path: "/admin/audit",
    element: pageContainer(<AdminPage />),
  },
  {
    path: "/admin/userStats",
    element: pageContainer(<AdminUserStats />),
  },
  {
    path: "/admin/users",
    element: pageContainer(<AdminUsers />),
  },
]

export const routes = [
  // {
  //   path: "/",
  //   Component: () => {
  //     return <div><Navigate replace to="/home"/></div>
  //   }
  // },
  {
    path: "/account/setting",
    element: pageContainer(<AccountSetting />),
  },
  ...newRoutes,
  ...cfgRoutes,
  ...adminRoutes,
  {
    path: "/*", 
    element: pageContainer(<DashboardPage />),
  },
  {
    path: "*",
    element: pageContainer(<NotFoundPage />),
  },
  {
    path: "/trace/:id/:datasourceId",
    element: <TracePage />,
  },
  {
    path: "/test",
    element: <TestPage />
  },
  {
    path: "/examples/iframe",
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

