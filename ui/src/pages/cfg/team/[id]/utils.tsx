import React from "react"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"

export const getTeamSubLinks = (id) => {
    return [
        { title: "members", url: `/cfg/team/${id}/members`, icon: <FaUserFriends /> },
        { title: "dashboard", url: `/cfg/team/${id}/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "sidemenu", url: `/cfg/team/${id}/sidemenu`, icon: <FaAlignLeft /> },
        { title: "settings", url: `/cfg/team/${id}/setting`, icon: <FaCog /> },
    ]
}