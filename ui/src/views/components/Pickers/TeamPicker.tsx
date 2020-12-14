import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { getBackendSrv } from 'src/core/services/backend'
import {Select} from 'antd'
import { Team } from 'src/types'

const {Option} = Select

interface Props {
    value : number[]
    onChange: any
    mutiple?: boolean
    enableAll? : boolean
    allowClear? : boolean
}

export const TeamPicker = (props:Props) =>{
    const [teams,setTeams]: [Team[],any] = useState([])
    const loadTeams = async () => {
        const res = await getBackendSrv().get(`/api/teams`)
        if (props.enableAll) {
            res.data.unshift({
                id: 0,
                name: 'all teams'
            })
        }
        setTeams(res.data)
    }

    useEffect(() => {
        loadTeams()
    },[])
    
    const options = teams.map((team) => {
        return <Option key={team.id} value={team.id}>{team.name}</Option>
    })

    const onChange = (v) => {
        if (props.mutiple) {
            if (_.indexOf(v, 0) !== -1) {
                props.onChange([0])
                return 
            }
        }

        props.onChange(v)
    }

    return (
        <>
            <Select 
                value={props.value} 
                className="width-14" 
                mode={props.mutiple? "multiple" : null} 
                onChange={onChange} 
                placeholder="teams"
                showSearch
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                allowClear={props.allowClear}
                >
                {options}
            </Select>
        </>
    )
}

export default TeamPicker