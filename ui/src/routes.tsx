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
import TestPage from "./pages/test";
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
const routes = [
  {
    path: "/",
    element: <div>Home</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/account/setting",
    element: <AccountSetting />,
  },
  {
    path: "/test",
    element: <TestPage />
  },
  ...newRoutes,
  ...cfgRoutes,
  {
    path: "/trace/:id/:datasourceId",
    element: <TracePage />,
  },
  {
    path: "/:dashboardId",
    element: <DashboardPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },

]


export default routes

