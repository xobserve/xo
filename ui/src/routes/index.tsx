/*eslint-disable*/
import React from 'react'

import _ from 'lodash'
import { StoreState, MenuPosition, Role, MenuItem } from 'src/types'
import { Store } from 'redux';
import { updateMenuItems } from 'src/store/reducers/menu';
import { getBootConfig, currentLang } from 'src/packages/datav-core/src';
import localeData from 'src/core/library/locale';

export let routers = []
export const initRoutes = (store: Store<StoreState>) => {
    getBootConfig().sidemenu.forEach((item: MenuItem) => {
        item.showPosition = MenuPosition.Top
        item.exact = true
        if (item.children && item.children.length != 0) {
            item.children.forEach((child) => {
                child.exact = true
                child.component = React.lazy(() => import('src/views/dashboard/DashboardPage'))
            })
        }

        item.component = React.lazy(() => import('src/views/dashboard/DashboardPage'))

        if (!item.id) {
            item.component = null
            item.redirectTo = null
        } else {
            item.redirectTo = item.url
        }
    })

    const dashboardMenumItems = getBootConfig().sidemenu

    const fixMenuItems: MenuItem[] = [
        {
            id: 'datav-fix-menu-d',
            url: '/d/:uid',
            title: 'Dashboard Page',
            icon: 'home-alt',
            subTitle: 'Dashboard Page',
            showPosition: null,
            exact:false,
            component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
        },

        {
            id: 'datav-fix-menu-plugin',
            url: '/plugin/:pluginID',
            title: 'Plugin Info',
            icon: 'home-alt',
            component: React.lazy(() => import('src/views/cfg/plugins/PluginPage')),
            subTitle: 'Plugin Info',
            showPosition: null,
            parentID: null,
            exact:false,
        },
        {
            id: 'datav-fix-menu-newDataSource',
            url: '/datasources/new',
            title: 'New Datasource',
            icon: 'home-alt',
            component: React.lazy(() => import('src/views/cfg/datasources/NewDataSourcePage')),
            subTitle: 'New Datasource',
            showPosition: null,
            parentID: null,
            exact: true
        },
        {
            id: 'datav-fix-menu-editDataSource',
            url: '/datasources/edit/:datasourceID',
            title: 'Edit DataSource',
            icon: 'home-alt',
            component: React.lazy(() => import('src/views/cfg/datasources/EditDataSourcePage')),
            subTitle: 'Edit DataSource',
            showPosition: null,
            parentID: null,
            exact:false
        },
        // these two are core menu items, be careful to modify
        {
            id: 'datav-fix-menu-new',
            url: '/new',
            title: localeData[currentLang]['common.new'],
            subTitle: localeData[currentLang]['common.addSubTitle'],
            icon: 'plus',
            showPosition: MenuPosition.Bottom,
            redirectTo: null,
            needRole: Role.Editor,
            exact: true,
            children: [
                {
                    icon: 'apps',
                    id: 'datav-fix-menu-create-dashboard',
                    url: '/new/dashboard',
                    title: localeData[currentLang]['common.dashboard'], 
                    exact: true,
                    component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
                },
                {
                    icon: 'apps',
                    id: 'datav-fix-menu-create-datasource',
                    url: '/datasources/new',
                    title: localeData[currentLang]['common.datasource'], 
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/datasources/NewDataSourcePage')),
                },
                {
                    icon: 'import',
                    id: 'datav-fix-menu-import-dashboard',
                    url: '/new/import',
                    title: localeData[currentLang]['common.import'],
                    exact: true,
                    component: React.lazy(() => import('src/views/dashboard/ImportPage'))
                },
                {
                    icon: 'folder',
                    id: 'datav-fix-menu-new-folder',
                    title:  localeData[currentLang]['common.folder'],
                    url: '/new/folder',
                    needRole: Role.Editor,
                    exact: true,
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
                },
                {
                    icon: 'users-alt',
                    id: 'datav-fix-menu-new-team',
                    title: localeData[currentLang]['common.team'],
                    url: '/new/team',
                    needRole: Role.Admin,
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/teams/TeamsPage'))
                },
            ],
        },
        {
            id: 'datav-fix-menu-alerting',
            url: '/alerting',
            title: localeData[currentLang]['common.alerting'],
            icon: 'bell',
            subTitle: localeData[currentLang]['common.alertingSubTitle'],
            showPosition: MenuPosition.Bottom,
            redirectTo: '/alerting/rules',
            exact: true,
            children: [
                { 
                    icon: "list-ul",
                    id: "datav-fix-menu-alerting-rules",
                    title: localeData[currentLang]['common.rules'],
                    url: "/alerting/rules",
                    exact: true,
                    component: React.lazy(() => import('src/views/alerting/AlertRulesPage'))
                },
                { 
                    icon: "history",
                    id: "datav-fix-menu-alerting-history", 
                    title: localeData[currentLang]['common.history'],
                    url: "/alerting/history",
                    exact: true, 
                    component: React.lazy(() => import('src/views/alerting/AlertHistoryPage'))
                },
            ]
        },
        {
            id: 'datav-fix-menu-cfg',
            url: '/cfg',
            title: localeData[currentLang]['common.configuration'],
            icon: 'cog',
            subTitle: localeData[currentLang]['common.cfgSubTitle'],
            showPosition: MenuPosition.Bottom,
            redirectTo: null,
            exact: true,
            children: [
                {
                    icon: "database",
                    id: "datav-fix-menu-datasources",
                    title: localeData[currentLang]['common.datasource'],
                    url: "/cfg/datasources",
                    needRole: Role.Admin,
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/datasources/DataSourceListPage'))
                },
                {
                    icon: "plug",
                    id: "datav-fix-menu-plugins",
                    title: localeData[currentLang]['common.plugin'],
                    url: "/cfg/plugins",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/plugins/Plugins'))
                },
                {
                    icon: "folder",
                    id: "datav-fix-menu-folders",
                    title: localeData[currentLang]['common.folder'],
                    url: "/cfg/folders",
                    needRole: Role.Editor,
                    exact: true,
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
                },
                {
                    icon: "users-alt",
                    id: "datav-fix-menu-users",
                    title: localeData[currentLang]['common.user'], 
                    url: "/cfg/users",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/users/UserPage'))
                },
                {
                    icon: "users-alt",
                    id: "datav-fix-menu-teams",
                    title: localeData[currentLang]['common.team'],
                    url: "/cfg/teams",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/teams/TeamsPage'))
                },
                { 
                    icon: "calculator-alt",
                    id: "datav-fix-menu-globalVariable",
                    title: localeData[currentLang]['common.globalVariable'],
                    url: "/cfg/globalVariable",
                    redirectTo: '/d/-1',
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/globalVariable/GlobalVariablePage'))
                },
            ]
        },
        {
            id: 'datav-fix-menu-team-manage',
            url: null,
            title:  localeData[currentLang]['common.teamManage'],
            icon: 'users-alt',
            subTitle: localeData[currentLang]['team.subTitle'], 
            showPosition: null,
            redirectTo: null,
            exact: true,
            children: [
                {
                    icon: "users-alt",
                    id: "datav-fix-menu-team-members",
                    title: localeData[currentLang]['common.member'],
                    url: "/team/members/:id",
                    exact: false,
                    component: React.lazy(() => import('src/views/cfg/teams/team/MemberPage'))
                },
                {
                    icon: "list-ul",
                    id: "datav-fix-menu-team-sidemenu",
                    title: localeData[currentLang]['team.sidemenu'],
                    url: "/team/sidemenu/:id",
                    exact: false,
                    component: React.lazy(() => import('src/views/cfg/teams/team/SideMenuPage'))
                },
                { 
                    icon: "list-ul",
                    id: "datav-fix-menu-alerting-rules",
                    title: localeData[currentLang]['common.rules'],
                    url: "/team/rules/:id",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/teams/team/AlertRulesPage'))
                },
                { 
                    icon: "history",
                    id: "datav-fix-menu-alerting-history", 
                    title: localeData[currentLang]['common.history'],
                    url: "/team/history/:id",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/teams/team/AlertHistoryPage'))
                },
                { 
                    icon: "at",
                    id: "datav-fix-menu-alerting-notifications",
                    title: localeData[currentLang]['common.notificationChannel'],
                    url: "/team/notifications/:id",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/teams/team/NotificationPage'))
                },
                {
                    icon: "cog",
                    id: "datav-fix-menu-team-setting",
                    title: localeData[currentLang]['common.setting'],
                    url: "/team/setting/:id",
                    exact: false,
                    component: React.lazy(() => import('src/views/cfg/teams/team/SettingPage'))
                },
            ]
        },
        {
            id: 'datav-fix-menu-manage-folder',
            url: null,
            title: 'Folder',
            icon: 'folder-open',
            subTitle: localeData[currentLang]['folder.subTitle'], 
            showPosition: null,
            redirectTo: null,
            exact: true,
            children: [
                {
                    icon: "th-large",
                    id: "datav-fix-menu-folder-dashboard",
                    title: "Dashboards",
                    url: "/f/:uid/dashboards",
                    exact: false,
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
                },
                {
                    icon: "cog",
                    id: "datav-fix-menu-folder-settings",
                    title: "Settings",
                    url: "/f/:uid/settings",
                    exact: false,
                    component: React.lazy(() => import('src/views/cfg/folders/SettingPage'))
                },
            ]
        },
        { 
            id: 'datav-fix-menu-user',
            url: '/user',
            title: localeData[currentLang]['user.currentUser'] + " - " + (store.getState().user.name == '' ? store.getState().user.username : store.getState().user.username + ' / ' + store.getState().user.name),
            subTitle: localeData[currentLang]['user.subTitle'],
            icon: 'user',
            showPosition: MenuPosition.Bottom,
            redirectTo: '/user/preferences',
            exact: true,
            children: [
                {
                    icon: "sliders-v-alt",
                    id: "datav-fix-menu-preferences",
                    title: localeData[currentLang]['common.preferences'],
                    url: "/user/preferences",
                    exact: true,
                    component: React.lazy(() => import('src/views/cfg/users/UserPreferencePage'))
                }
            ]
        },
        {
            id: 'datav-fix-menu-help',
            url: '/help',
            title: localeData[currentLang]['common.help'],
            icon: 'question-circle',
            redirectTo: null,
            exact: true,
            showPosition: MenuPosition.Bottom,
        }
    ]

    const menuItems = _.concat(dashboardMenumItems, fixMenuItems)
    store.dispatch(updateMenuItems(menuItems))

    const dashRouters = []

    dashboardMenumItems.map((menuItem: any) => {
        dashRouters.push(menuItem)
        if (!_.isEmpty(menuItem.children)) {
            menuItem.children.map(r => {
                r.url =  menuItem.url + r.url 
                r.parentID = menuItem.id
                // concat route.path and its child's path
                dashRouters.push(r)
            })
        }
    })
    const fixRouters = []
    fixMenuItems.map((menuItem: any) => {
        if (!_.isEmpty(menuItem.children)) {
            menuItem.children.map(r => {
                r.parentID = menuItem.id
                // concat route.path and its child's path
                fixRouters.push(r)
            })
        } else {
            fixRouters.push(menuItem)
        }
    })

    routers = _.concat(dashRouters,fixRouters)
}

// urls are reserved in datav, cant be used by users
export const reservedUrls = ['/d','/plugin','/datasources','/new','/cfg','/team','/f','/user','/help','/t']