
import React from "react"
import { FaUserEdit } from "react-icons/fa"
import { isEmpty } from "utils/validate"

export const getAccountLinks = (teamId) => {
    let teamPath = ''
    if (!isEmpty(teamId)) {
        teamPath = `/${teamId}`
    }
    return [
        {
            title: 'user',
            url: `${teamPath}/account/setting`,
            baseUrl:`${teamPath}/account/setting`,
            icon: <FaUserEdit />
        }
    ]
}