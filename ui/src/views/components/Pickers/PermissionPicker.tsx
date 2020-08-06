import React from 'react'
import { Select } from 'antd'
const {Option} = Select

interface Props {
    value: number[]
    onChange?: any 
    disabled?: boolean
    minWidth?: string
}

const PermissionPicker = (props:Props) => {
    return (
        <Select 
            value={props.value} 
            onChange={props.onChange} 
            mode="multiple"
            style={{maxWidth: '100%',minWidth: props.minWidth ?? '100px'}}
            disabled={props.disabled}
            placeholder="forbidden to do anything"
        >     
            <Option value={1}>View</Option>
            <Option value={2}>Add</Option>
            <Option value={3}>Edit</Option>
            <Option value={4}>Save</Option>
            <Option value={5}>Delete</Option>
            <Option value={6}>Permission</Option>
        </Select>
    )
}

export default PermissionPicker