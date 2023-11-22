import React from 'react'
import { FaUser, FaUserCog } from 'react-icons/fa'
import { MdOutlineAdminPanelSettings } from 'react-icons/md'
import { isEmpty } from 'utils/validate'

export const getAdminLinks = (teamId) => {
  let teamPath = ''
  if (!isEmpty(teamId)) {
    teamPath = `/${teamId}`
  }
  return [
    {
      title: 'auditLog',
      url: `/admin/audit`,
      baseUrl: `/admin/audit`,
      icon: <MdOutlineAdminPanelSettings />,
    },
    {
      title: 'tenant',
      url: `/admin/tenants`,
      baseUrl: `/admin/tenants`,
      icon: <FaUser />,
    },
    {
      title: 'user',
      url: `/admin/users`,
      baseUrl: `/admin/users`,
      icon: <FaUserCog />,
    },
  ]
}
