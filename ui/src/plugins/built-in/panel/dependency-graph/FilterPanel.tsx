import React from 'react'
import { Modal } from 'antd'

interface Props {
    onChange: any
    onClose: any
    value: any
}

const FilterPanel = (props:Props) =>{
    console.log(props.value)
    return (
        <>
            <Modal title="Set filter conditions" onCancel={props.onClose} visible={true} onOk={props.onChange}>

            </Modal>
        </>
    )
}


export default FilterPanel;