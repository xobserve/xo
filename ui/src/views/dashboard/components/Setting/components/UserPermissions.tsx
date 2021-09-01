import React from 'react'
import PermissionPicker from 'src/views/components/Pickers/PermissionPicker'
import { CloseOutlined } from '@ant-design/icons'

interface UserPermission {
    userId : number 
    username: string
    name: string
    permission: number[]
}

interface Props {
    permissions : UserPermission[]
    onChange?: any 
    onDelete?: any
}

const UserPermissions = (props:Props) =>{
    return (
        <table className="filter-table gf-form-group">
            <tbody>
                {
                    props.permissions.map((permission) => {
                        return (
                            <tr style={{display:'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'}} key={permission.userId}>
                                <td>
                                    {permission.username + (permission.name ? ' / '+ permission.name: '')}
                                </td>
                                
                                <td>
                                    <span className="color-primary ub-mr2">{permission.permission.length === 0 ? "IS" : "CAN"}</span> 
                                    <PermissionPicker minWidth="447px" value={permission.permission} onChange={(v) => props.onChange(permission.userId,v)}/> 
                                    <CloseOutlined translate className="ub-ml1 color-error pointer" onClick={() => props.onDelete(permission.userId)}/>
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

export default UserPermissions