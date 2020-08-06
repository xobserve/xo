import React, { useState } from 'react'
import { LinkButton,Form,FormField as Field,Input} from 'src/packages/datav-core/src'
import {Modal,Button, notification} from 'antd'
import {getBackendSrv} from 'src/core/services/backend'
import { useIntl,FormattedMessage } from 'react-intl'
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store'

interface Props {
    onAddTeam : any
}


const AddTeam = (props: Props) => {
    const intl = useIntl()
    const [modalVisible,setModalVisible] = useState(false)

    const initialFormModel = {
        name: ''
    }

    const addTeam = async (team)  => {
        const res = await getBackendSrv().post('/api/admin/team/new',team)
        props.onAddTeam(res.data)
        notification['success']({
            message: "Success",
            description: intl.formatMessage({id: "info.targetCreated"}),
            duration: 5
          });
        setModalVisible(false)
    }

    const validateName = async (name) => {
        name = (name || '').trim();
        if (name.length === 0) {
            return localeData[getState().application.locale]['error.targetIsRequired']
        }

        const res = await getBackendSrv().get('/api/teams/team',{name: name})
        if (res.data.id == 0) {
            return true
        }

        return localeData[getState().application.locale]['error.targetExist']
    }

    return (
        <>
            <LinkButton onClick={() => setModalVisible(true)}><FormattedMessage id="team.add"/></LinkButton>
            <Modal
                title={<FormattedMessage id="team.add"/>}
                visible={modalVisible}
                footer={null}
                onCancel={() => setModalVisible(false)}
            >
                <Form 
                    //@ts-ignore
                    defaultValues={initialFormModel} 
                    onSubmit={addTeam}
                >
                    {({ register, errors }) => (
                        <>
                            <Field
                                label={<FormattedMessage id="team.name"/>}
                                invalid={!!errors.name}
                                //@ts-ignore
                                error={errors.name && errors.name.message}
                            >
                                <Input
                                    name="name"
                                    ref={register({
                                        required: localeData[getState().application.locale]['error.targetIsRequired'],
                                        validate: async v => await validateName(v),
                                    })}
                                />
                            </Field>
                            <Button type="primary" htmlType="submit" style={{marginTop: '16px'}}><FormattedMessage id="common.submit"/></Button>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    )
}

export default AddTeam