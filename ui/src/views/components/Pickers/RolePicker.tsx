import React from 'react'
import {RadioButtonGroup} from 'src/packages/datav-core/src'
import { Role } from 'src/types';

export interface Props {
    onChange? : any
    value?: Role 
    options?: any
}

const roles = [
    { label: 'Viewer', value: Role.Viewer },
    { label: 'Editor', value: Role.Editor },
    { label: 'Admin', value: Role.Admin },
  ];

const RolePicker = (props:Props) =>{
    return (
            <RadioButtonGroup onChange={props.onChange} value={props.value} options={props.options ?? roles}/>
    )
}
 
export default RolePicker