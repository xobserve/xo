
import React from "react"
import { FaUser, FaUserCog, FaUsers } from "react-icons/fa"
import { MdOutlineAdminPanelSettings } from "react-icons/md"
import { isEmpty } from "utils/validate"

export const getAdminLinks = (teamId) => {
    let teamPath = ''
    if (!isEmpty(teamId)) {
        teamPath = `/${teamId}`
    }
    return [
        {
            title: 'auditLog',
            url: `${teamPath}/admin/audit`,
            baseUrl: `${teamPath}/admin/audit`,
            icon: <MdOutlineAdminPanelSettings />
        },
        {
            title: 'tenant',
            url: `${teamPath}/admin/tenants`,
            baseUrl: `${teamPath}/admin/tenants`,
            icon: <FaUser />
        },
        {
            title: 'user',
            url: `/${teamId}/admin/users`,
            baseUrl: `/${teamId}/admin/users`,
            icon: <FaUserCog />
        },
    ]
}

export const getTenantLinks = (teamId) => {
    let teamPath = ''
    if (!isEmpty(teamId)) {
        teamPath = `/${teamId}`
    }
    
    return [
        {
            title: 'members',
            url: `${teamPath}/admin/tenant/users`,
            baseUrl: `${teamPath}/admin/tenant/users`,
            icon: <FaUserCog />
        },
        {
            title: 'team',
            url: `${teamPath}/admin/tenant/teams`,
            baseUrl: `${teamPath}/admin/tenant/teams`,
            icon: <FaUsers />
        },
    ]
}
