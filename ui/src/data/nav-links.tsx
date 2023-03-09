import {  FaBell, FaDatabase, FaHome,FaRegChartBar, FaThLarge, FaUser, FaUserEdit, FaUsersCog } from 'react-icons/fa'
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
        subLinks: [
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
    },
]


