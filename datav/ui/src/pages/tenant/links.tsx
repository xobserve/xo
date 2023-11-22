
import React from "react"
import { FaCog, FaUserCog, FaUsers } from "react-icons/fa"
import { isEmpty } from "utils/validate"
export const getTenantLinks = (teamId) => {
    let teamPath = ''
    if (!isEmpty(teamId)) {
        teamPath = `/${teamId}`
    }

    return [
        {
            title: 'members',
            url: `${teamPath}/tenant/users`,
            baseUrl: `${teamPath}/tenant/users`,
            icon: <FaUserCog />
        },
        {
            title: 'team',
            url: `${teamPath}/tenant/teams`,
            baseUrl: `${teamPath}/tenant/teams`,
            icon: <FaUsers />
        },
        {
            title: 'settings',
            url: `${teamPath}/tenant/setting`,
            baseUrl: `${teamPath}/tenant/setting`,
            icon: <FaCog />
        },
    ]
}
