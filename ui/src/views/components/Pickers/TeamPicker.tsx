import React, { useEffect, useState } from 'react'
import { getBackendSrv } from 'src/core/services/backend'
import {Select} from 'antd'
import { Team } from 'src/types'

const {Option} = Select

interface Props {
    value : number[]
    onChange: any
    mutiple?: boolean
}

const TeamPicker = (props:Props) =>{
    const [teams,setTeams]: [Team[],any] = useState([])
    const loadTeams = async () => {
        const res = await getBackendSrv().get(`/api/teams`)
        setTeams(res.data)
    }

    useEffect(() => {
        loadTeams()
    },[])
    
    const options = teams.map((team) => {
        return <Option key={team.id} value={team.id}>{team.name}</Option>
    })

    return (
        <>
            <Select 
                value={props.value} 
                className="width-14" 
                mode={props.mutiple? "multiple" : null} 
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

export default TeamPicker