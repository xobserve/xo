// Copyright 2023 Datav.io Team
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
import AccountSetting from "./pages/account/Setting";
import NewDashboardPage from "./pages/new/Dashboard";
import NewDatasourcePage from "./pages/new/Datasource";
import ImportDashboardPage from "./pages/new/Import";
import DatasourcesPage from "./pages/cfg/Datasources";
import TeamsPage from "./pages/cfg/Teams";
import GlobalVariablesPage from "./pages/cfg/Variables";
import UsersPage from "./pages/cfg/Users";
import TeamDashboardsPage from "./pages/cfg/team/[id]/Dashboards";
import TeamMembersPage from "./pages/cfg/team/[id]/Members";
import TeamSettingPage from "./pages/cfg/team/[id]/Setting";
import TeamSidemenuPage from "./pages/cfg/team/[id]/Sidemenu";
import TestPage from "./pages/Test";
import loadable from '@loadable/component';


const DashboardPage = loadable(() => import('./pages/dashboard/index'));
const TracePage = loadable(() => import('./pages/dashboard/Trace'));

const cfgRoutes = [
  {
    path: "/cfg/datasources",
    element:  <DatasourcesPage />,
  },
  {
    path: "/cfg/teams",
    element: <TeamsPage />,
  },
  {
    path: "/cfg/variables",
    element: <GlobalVariablesPage />,
  },
  {
    path: "/cfg/users",
    element: <UsersPage />,
  },
  {
    path: "/cfg/team/:id/dashboards",
    element: <TeamDashboardsPage />,
  },
  {
    path: "/cfg/team/:id/members",
    element: <TeamMembersPage />,
  },
  {
    path: "/cfg/team/:id/setting",
    element: <TeamSettingPage />,
  },
  {
    path: "/cfg/team/:id/sidemenu",
    element: <TeamSidemenuPage />,
  },
]

const newRoutes = [
  {
    path: "/new/dashboard",
    element: <NewDashboardPage />,
  },
  {
    path: "/new/datasource",
    element: <NewDatasourcePage />,
  },
  {
    path: "/new/import",
    element: <ImportDashboardPage />,
  },
]

export const containerRoutes = [
  {
    path: "/account/setting",
    element: <AccountSetting />,
  },
  ...newRoutes,
  ...cfgRoutes,
  {
    path: "/:dashboardId/*", 
    element: <DashboardPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },

]

export const noContainerRoutes = [
  {
    path: "/trace/:id/:datasourceId",
    element: <TracePage />,
  },
  {
    path: "/test",
    element: <TestPage />
  },
  {
    path: "/login",
    element: <Login />,
  },
]
