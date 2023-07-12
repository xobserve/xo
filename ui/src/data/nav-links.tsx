import React from 'react'
import {  FaBell, FaConnectdevelop, FaDatabase, FaHome,FaRegChartBar, FaTerminal, FaThLarge, FaUser, FaUserEdit, FaUsersCog } from 'react-icons/fa'
import { Route } from 'types/route'

// 这里是默认的主菜单设置，但是会被服务器的配置所覆盖！
export const navLinks: Route[] = [
    {
        title: '首页大盘',
        url: '/home',
        icon: "FaHome"
    },
    {
        title: '应用监控',
        url: '/apps',
        icon: "FaThLarge",
        children: [
            {
                title: '应用列表',
                url: '/apps/list',
            },
            {
                title: '接口统计',
                url: '/apps/api',
            }
        ]
    },
    {
        title: '服务器监控',
        url: '/servers',
        icon: "FaRegChartBar"
    }
]


export const accountLinks = [
    {
        title: 'Setting',
        url: '/account/setting',
        baseUrl: '/account/setting',
        icon: <FaUserEdit />
    }
]

export const cfgLinks = [
    {
        title: 'Datasources',
        url: '/cfg/datasources',
        baseUrl: '/cfg/datasources',
        icon: <FaConnectdevelop />
    },
    {
        title: 'Variables',
        url: '/cfg/variables',
        baseUrl: '/cfg/variables',
        icon: <FaTerminal />
    },
    {
        title: 'Teams',
        url: '/cfg/teams',
        baseUrl: '/cfg/teams',
        icon: <FaUsersCog />
    },
    {
        title: 'Users',
        url: '/cfg/users',
        baseUrl: '/cfg/users',
        icon: <FaUser />
    }
]


export const newLinks = [
    {
        title: 'New Dashboard',
        url: '/new/dashboard',
        baseUrl: '/new/dashboard',
        // icon: <FaUsersCog />
    },
    {
        title: 'Import Dashboard',
        url: '/new/import',
        baseUrl: '/new/import',
        // icon: <FaUsersCog />
    },
    {
        title: 'New Datasource',
        url: '/new/datasource',
        baseUrl: '/new/datasource',
        // icon: <FaUsersCog />
    },
]
