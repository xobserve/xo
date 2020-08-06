import React, { useEffect, useState } from 'react'
import { getBackendSrv } from 'src/core/services/backend'
import {Select} from 'antd'
import { UserState } from 'src/store/reducers/user'
const {Option} = Select

interface Props {
    onChange : any
    value: number[]
    excludedUsers?: any
    multiple?: boolean
}

const UserPicker = (props:Props) =>{
    const {multiple=false} = props
    const [users,setUsers]: [UserState[],any] = useState([])
    const loadUsers = async () => {
        const res = await getBackendSrv().get('/api/users')
        const users = []
        res.data.forEach((user) => {
            if (!props.excludedUsers) {
                users.push(user)
                return 
            }
            if (!props.excludedUsers[user.id]) {
                users.push(user)
            }
        })
        setUsers(users)
    }

    useEffect(() => {
        loadUsers()
    },[])
    
    const options = users.map((user) => {
        return <Option key={user.id} value={user.id}>{user.username}</Option>
    })

    
    return (
        <>
            <Select 
                value={props.value} 
                className="width-14" 
                mode={multiple  ? "multiple" : null}
                onChange={props.onChange} 
                showSearch
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                >
                {options}
            </Select>
        </>
    )
}

export default UserPicker