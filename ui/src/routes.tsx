import React from "react";
import Login from "src/pages/login";
import NotFoundPage from "src/pages/404";
import AccountSetting from "./pages/account/setting";
import NewDashboardPage from "./pages/new/dashboard";
import NewDatasourcePage from "./pages/new/datasource";
import ImportDashboardPage from "./pages/new/import";
import TracePage from "./pages/datasource/[datasourceId]/trace/[id]";
import DatasourcesPage from "./pages/cfg/datasources";
import TeamsPage from "./pages/cfg/teams";
import GlobalVariablesPage from "./pages/cfg/variables";
import UsersPage from "./pages/cfg/users";
import TeamDashboardsPage from "./pages/cfg/team/[id]/dashboards";
import TeamMembersPage from "./pages/cfg/team/[id]/members";
import TeamSettingPage from "./pages/cfg/team/[id]/setting";
import TeamSidemenuPage from "./pages/cfg/team/[id]/sidemenu";

const cfgRoutes = [
  {
    path: "/cfg/datasources",
    element: <DatasourcesPage />,
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
      path: "/datasource/:datasourceId/trace/:id",
      element: <TracePage />,
    },
    ...newRoutes,
    ...cfgRoutes,
    {
      path: "*",
      element: <NotFoundPage />,
    },

]


export default routes

