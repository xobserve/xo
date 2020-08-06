import React, { useState } from 'react'

import {Modal,Button} from 'antd'
import {Form,FormField as Field} from 'src/packages/datav-core' 
import UserPicker from 'src/views/components/Pickers/UserPicker'
import PermissionPicker from 'src/views/components/Pickers/PermissionPicker'
import { FormattedMessage } from 'react-intl'

interface Props {
    onSubmit : any
    visible: boolean
    setVisible: any
}

const AddExtraPermission = (props:Props) =>{
    const [user,setUser] = useState([])
    const [permission,setPermission] = useState([1])
    return (
        <>
             <Modal
                title={<FormattedMessage id="dashboard.addUserPermission"/>}
                visible={props.visible}
                footer={null}
                onCancel={() => props.setVisible(false)}
            >
                <Form 
                    //@ts-ignore
                    onSubmit={props.onSubmit}
                >
                    {({ register, errors }) => (
                        <>
                            <Field
                                label="User" 
                            >
                                <UserPicker onChange={(v) => setUser(v)} value={user} />
                            </Field>

                            <Field label="User Can">
                                <PermissionPicker onChange={(v) => setPermission(v)} value={permission} minWidth="200px"/>
                            </Field>
                            <Button type="primary" onClick={() => {props.onSubmit(user,permission)}} style={{marginTop: '16px'}}><FormattedMessage id="common.submit"/></Button>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    )
}

export default AddExtraPermission