
import React from "react"
import { isEmpty } from "utils/validate"
export const getNewLinks = (teamId) => {
    let teamPath = ''
    if (!isEmpty(teamId)) {
        teamPath = `/${teamId}`
    }

    return [
        {
            title: `NewDashboard`,
            url: `${teamPath}/new/dashboard`,
            baseUrl: `/${teamId}/new/dashboard`,
            // icon: <FaUsersCog />
        },
        {
            title: `ImportDashboard`,
            url: `${teamPath}/new/import`,
            baseUrl: `${teamPath}/new/import`,
            // icon: <FaUsersCog />
        },
        {
            title: 'NewDatasource',
            url: `${teamPath}/new/datasource`,
            baseUrl: `${teamPath}/new/datasource`,
            // icon: <FaUsersCog />
        },
    ]
}