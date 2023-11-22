
import React from "react"
import { FaUser, FaUserCog } from "react-icons/fa"
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
            url: `${teamPath}/admin/users`,
            baseUrl: `${teamPath}/admin/users`,
            icon: <FaUserCog />
        },
    ]
}
