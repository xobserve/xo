import React, { useEffect, useState } from 'react'
import { getBackendSrv } from 'src/core/services/backend/backend'
import {Select} from 'antd'
import { TeamMember } from 'src/types'

const {Option} = Select

interface Props {
    teamId : string
    onChange: any
    mutiple?: boolean
}

const TeamMemberPicker = (props:Props) =>{
    const [members,setMembers]: [TeamMember[],any] = useState([])
    const loadMembers = async () => {
        const res = await getBackendSrv().get(`/api/teams/members/${props.teamId}`)
        setMembers(res.data)
    }

    useEffect(() => {
        loadMembers()
    },[])
    
    const options = members.map((user) => {
        return <Option key={user.id} value={user.id}>{user.username}</Option>
    })

    return (
        <>
            <Select 
                className="width-14" 
                mode={props.mutiple? "multiple" : null} 
                onChange={props.onChange} 
                showSearch 
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                {options}
            </Select>
        </>
    )
}

export default TeamMemberPicker