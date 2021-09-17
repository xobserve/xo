import React, { useState } from 'react'
import { UserState } from 'src/store/reducers/user'
import { Table, Space, Modal,notification,Tag,Tooltip} from 'antd'
import UserProfile from './components/UserProfile'
import { getBackendSrv } from 'src/core/services/backend/backend';
import { getState } from 'src/store/store';
import { isAdmin } from 'src/types';
import { useIntl,FormattedMessage } from 'react-intl';

interface Props {
    users: UserState[]
    reloadUsers: any
}

const UserTable = (props: Props) => {
    const intl = useIntl()
    const [editUserVisible, setEditUserVisible] = useState(false)
    const [userEdit, setUserEdit] = useState(null)

    props.users?.map((user) => {
        //@ts-ignore
        user.key = user.id
    })

    const editUser = (user) => {
        setUserEdit(user)
        setEditUserVisible(true)
    }
    const columns = [
        {
            title: <FormattedMessage id="user.username"/>,
            key: 'username',
            render: (_, user:UserState) => (
                <>
                <span>{user.username}</span>
                {user.id === "1" && <Tooltip title={<FormattedMessage id="user.superAdminTips"/>}><Tag className="ub-ml1">Super Admin</Tag></Tooltip>}
                {getState().user.id === user.id && <Tag className="ub-ml1">You</Tag>}
                </>
            ),
        },
        ...rawColumns,
        {
            title: <FormattedMessage id="user.globalRole"/>,
            key: 'role',
            render: (_, user:UserState) => (
                <>
                    {user.id === "1"? <span>Super Admin</span> :<span>{user.role}</span>}
                </>
            ),
        },
        isAdmin(getState().user.role) ? {
            title: <FormattedMessage id="common.action"/>,
            key: 'action',
            render: (_, user) => (
                <Space size="middle">
                    <span onClick={() => editUser(user)} className="pointer"><FormattedMessage id="common.edit"/></span>
                </Space>
            ),
        } : {}
    ]

    const onUserDelete = (user) => {
        getBackendSrv().delete(`/api/admin/user/${user.id}`).then(() => {
            notification['success']({
                message: "Success",
                description: intl.formatMessage({id: "info.targetDeleted"}),
                duration: 5
            });

            props.reloadUsers()

            setEditUserVisible(false)
        })
    }
    return (
        <>
            <Table
                columns={columns}
                dataSource={props.users}
                pagination={false}
            />
            {editUserVisible &&
                <Modal
                    title={<FormattedMessage id="user.edit"/>}
                    visible={true}
                    footer={null}
                    onCancel={() => setEditUserVisible(false)}
                    maskClosable={false}
                >
                    <UserProfile user={userEdit} onUserDelete={onUserDelete} reloadUsers={props.reloadUsers}/>
                </Modal>}
        </>
    )

}

export default UserTable

const rawColumns = [
    {
        title: <FormattedMessage id="user.name"/>,
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: <FormattedMessage id="user.email"/>,
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: <FormattedMessage id="user.mobile"/>,
        dataIndex: 'mobile',
        key: 'mobile',
    },
    // {
    //     title: 'Last seen',
    //     dataIndex: 'lastSeenAt',
    //     key: 'lastSeenAt'
    // }
]

// item.time = dateTimeFormat(item.time, {
//     format : 'MMM D, YYYY HH:mm:ss',
//     timeZone: getTimeSrv().timezone,
//   })