import React, { useState } from 'react'
import { Table, Space, Modal,notification, Tag} from 'antd'
import { getBackendSrv } from 'src/core/services/backend';
import { TeamMember, isAdmin } from 'src/types';
import { ConfirmModal } from 'src/packages/datav-core/src/ui';
import appEvents from 'src/core/library/utils/app_events';
import EditMember from './EditMember'
import { getState } from 'src/store/store';
import { useIntl,FormattedMessage } from 'react-intl';
import localeData from 'src/core/library/locale'
interface Props {
    teamId: string
    members: TeamMember[]
    teamCreatedBy : string
    teamMemberOfCurrentUser: TeamMember
}


const MemberTable = (props: Props) => {
    const intl = useIntl()
    const [delModalVisible,setDelModalVisible] = useState(false)
    const [tempMember,setTempMember]:[TeamMember,any]= useState(null)
    const [editVisible,setEditVisible] = useState(false)

    const deleteMember = () => {
        if (tempMember) {
            getBackendSrv().delete(`/api/teams/${props.teamId}/${tempMember.id}`).then(() => {
                appEvents.emit('update-team-member')
                notification['success']({
                    message: "Success",
                    description: intl.formatMessage({id: "info.targetDeleted"}),
                    duration: 5
                  });
            })
        }
        setDelModalVisible(false)
    }

    const columns = [
        {
            title: <FormattedMessage id="user.username"/>,
            key: 'username',
            render: (_, member) => (
                <>
                <span>{member.username}</span>
                {props.teamCreatedBy === member.id && <Tag className="ub-ml1">Creator</Tag>}
                {getState().user.id === member.id && <Tag className="ub-ml1">You</Tag>}
                </>
            ),
        },
        ...rawColumns,
       isAdmin(props.teamMemberOfCurrentUser.role) ? {
            title: <FormattedMessage id="common.action"/>,
            key: 'action',
            render: (_, member) => (
                <Space size="middle">
                    <span onClick={() => {
                        setTempMember(member)
                        setEditVisible(true)
                    }} className="pointer"><FormattedMessage id="common.edit"/></span>
                    <span onClick={() => {
                        setTempMember(member)
                        setDelModalVisible(true)
                    }} className="pointer"><FormattedMessage id="common.delete"/></span>
                </Space>
            ),
        } : {}
    ]


    return (
        <>
            <Table
                columns={columns}
                dataSource={props.members}
                pagination={false}
            />
            {editVisible && <EditMember teamId={props.teamId} member={tempMember} onCancelEdit={() => setEditVisible(false)}/>}
            <ConfirmModal
                isOpen={delModalVisible}
                title={localeData[getState().application.locale]['team.deleteMember']}
                body={<FormattedMessage id="team.deleteConfirmBody"/>}
                confirmText="Delete"
                onConfirm={() => deleteMember()}
                onDismiss={() =>setDelModalVisible(false)}
            />
        </>
    )

}

export default MemberTable

const rawColumns = [
    {
        title: <FormattedMessage id="team.memberRole"/>,
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: <FormattedMessage id="common.joined"/>,
        dataIndex: 'createdAge',
        key: 'createdAge',
    }
]