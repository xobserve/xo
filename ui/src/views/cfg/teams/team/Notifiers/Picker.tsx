import React from 'react'
import _ from 'lodash'
import Email from './Email'

import { Select } from 'antd'
const { Option } = Select


interface Props {
    value: string
    onChange: any
    className?: string
}

export const notifiers = {
    'email': Email
}

export const NotifierPicker = (props: Props) => {
    const notifierOptions = _.keys(notifiers).map((notifier) => {
        return <Option value={notifier} key={notifier}>{notifier}</Option>
    })

    return (
        <Select defaultValue={props.value} onChange={props.onChange} className={props.className}>
            {notifierOptions}
        </Select>
    )
}

