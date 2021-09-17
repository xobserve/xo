import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { InlineFormLabel} from 'src/packages/datav-core/src/ui'
import { notification } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { getBackendSrv } from 'src/core/services/backend/backend'
import { Role } from 'src/types'
import PermissionPicker from 'src/views/components/Pickers/PermissionPicker'
import { useIntl,FormattedMessage } from 'react-intl'

interface Props {
    teamId: string
}

const TeamPermission = (props:Props) =>{    
    const intl = useIntl()  
    const [permissions,setPermissions] = useState(null)
    useEffect(() => {
        loadPermissions()
    },[])

    const loadPermissions = async() => {
        const res = await getBackendSrv().get(`/api/teams/permissions/${props.teamId}`)
        setPermissions(res.data)
    }

    const changePermission = async (role, newPermission) => {
        await getBackendSrv().post(`/api/teams/permissions/${props.teamId}`,{"role" : role,"permission":newPermission})
        const newPermissions = _.cloneDeep(permissions)
        newPermissions[role] = newPermission
        setPermissions(newPermissions)
        notification['success']({
            message: "Success",
            description: intl.formatMessage({id: "info.permissionUpdated"}),
            duration: 5
          });
    }
    return (
        <>
             {
                permissions && <form name="teamDetailsForm" className="gf-form-group">
                    <div className="gf-form max-width-50">
                        <InlineFormLabel>Admin</InlineFormLabel>
                        <span className="color-primary ub-mr2">Can</span><PermissionPicker value={permissions[Role.Admin]}  disabled/>
                        <LockOutlined translate/>
                    </div>
                    <div className="gf-form max-width-50 ub-mt2">
                        <InlineFormLabel>Editor</InlineFormLabel>
                        <span className="color-primary ub-mr2">Can</span><PermissionPicker value={permissions[Role.Editor]} onChange={(v) => changePermission(Role.Editor,v)}/>
                    </div>
                    <div className="gf-form max-width-50 ub-mt2">
                        <InlineFormLabel>Viewer</InlineFormLabel>
                        <span className="color-primary ub-mr2">Can</span><PermissionPicker value={permissions[Role.Viewer]} onChange={(v) => changePermission(Role.Viewer,v)}/>
                    </div>
                </form>
            }
        </>
    )
}

export default TeamPermission