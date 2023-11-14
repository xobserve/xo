import React from 'react'
import { FaConnectdevelop,  FaTerminal, FaUser, FaUserCog, FaUserEdit,  FaUsers,  FaUsersCog } from 'react-icons/fa'
import { Route } from 'types/route'
import { MdOutlineAdminPanelSettings } from 'react-icons/md';

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






export const cfgLinks = [
    {
        title: 'team',
        url: '/cfg/teams',
        baseUrl: '/cfg/teams',
        icon: <FaUsersCog />
    },
]


