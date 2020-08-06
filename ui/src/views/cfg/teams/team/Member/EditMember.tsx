import React, { useState, useEffect } from 'react'
import {  Form, FormField as Field } from 'src/packages/datav-core/src'
import { Modal, Button, notification } from 'antd'
import { getBackendSrv } from 'src/core/services/backend'
import appEvents from 'src/core/library/utils/app_events'
import RolePicker from 'src/views/components/Pickers/RolePicker'
import {  TeamMember } from 'src/types'
import {useIntl, FormattedMessage } from 'react-intl'

interface Props {
    teamId: number
    member: TeamMember
    onCancelEdit: any
}


const EditMember = (props: Props) => {
    const intl = useIntl()
    const [tempMember, setTempMember] : [TeamMember,any]= useState(null)

    useEffect(() => {
        setTempMember(props.member)
    },[])
    const updateMember = async () => {
        props.onCancelEdit()
        tempMember.teamId = props.teamId
        getBackendSrv().post(`/api/teams/team/${props.teamId}/member`, tempMember).then(() => {
            appEvents.emit('update-team-member')
            notification['success']({
                message: "Success",
                description: intl.formatMessage({id: "info.targetUpdated"}),
                duration: 5
              });
        })

    }

    return (
        <>
            {
                tempMember && <Modal
                    title={<FormattedMessage id="team.editMember"/>}
                    visible={true}
                    footer={null}
                    onCancel={props.onCancelEdit}
                >
                    <Form
                        //@ts-ignore
                        onSubmit={updateMember}
                    >
                        {({ register, errors }) => (
                            <>

                                <Field label={<FormattedMessage id="team.memberRole"/>}>
                                    <RolePicker onChange={(v) => setTempMember({...tempMember,role: v})} value={tempMember.role} />
                                </Field>
                                <Button type="primary" htmlType="submit" style={{ marginTop: '16px' }}><FormattedMessage id="common.submit"/></Button>
                            </>
                        )}
                    </Form>
                </Modal>
            }
        </>
    )
}

export default EditMember