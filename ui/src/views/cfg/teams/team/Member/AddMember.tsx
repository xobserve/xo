import React, { useState } from 'react'
import { LinkButton,Form,Field,Input} from 'src/packages/datav-core/src/ui'
import {Modal,Button, notification, message} from 'antd'
import {getBackendSrv} from 'src/core/services/backend'
import appEvents from 'src/core/library/utils/app_events'
import UserPicker from 'src/views/components/Pickers/UserPicker'
import RolePicker from 'src/views/components/Pickers/RolePicker'
import { Role } from 'src/types'
import {useIntl, FormattedMessage } from 'react-intl'

interface Props {
    teamId: string
    inTeamMembers: {}
}
 

const AddMember = (props: Props) => {
    const intl = useIntl()
    const [modalVisible,setModalVisible] = useState(false)
    const [selectedMembers,setSelectedMembers] = useState([])
    const [memberRole,setMemberRole] = useState(Role.Viewer)
    const addMember = async ()  => {
        setSelectedMembers([])
        setModalVisible(false)
        setMemberRole(Role.Viewer)

        getBackendSrv().post(`/api/teams/members/${props.teamId}`,{members : selectedMembers, role: memberRole}).then(() => {
            appEvents.emit('update-team-member')
            notification['success']({
                message: "Success",
                description: intl.formatMessage({id: "info.targetCreated"}),
                duration: 5
              });
        })

    }

    const selectMember = (val) => {
        setSelectedMembers(val)
    }

    return (
        <>
            <LinkButton onClick={() => setModalVisible(true)}><FormattedMessage id="team.addMember"/></LinkButton>
            <Modal
                title={<FormattedMessage id="team.addMember"/>}
                visible={modalVisible}
                footer={null}
                onCancel={() => setModalVisible(false)}
            >
                <Form 
                    //@ts-ignore
                    onSubmit={addMember}
                >
                    {({ register, errors }) => (
                        <>
                            <Field
                                label={<FormattedMessage id="team.member"/>}
                            >
                                <UserPicker onChange={selectMember} value={selectedMembers} excludedUsers={props.inTeamMembers} multiple/>
                            </Field>

                            <Field label={<FormattedMessage id="team.memberRole"/>}>
                                <RolePicker onChange={setMemberRole} value={memberRole}/>
                            </Field>
                            <Button type="primary" htmlType="submit" style={{marginTop: '16px'}}><FormattedMessage id="common.submit"/></Button>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    )
}

export default AddMember