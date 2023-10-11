// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useStore } from "@nanostores/react"
import Page from "layouts/page/Page"
import React, { memo, useEffect, useState } from "react"
import { adminLinks } from "src/data/nav-links"
import { commonMsg } from "src/i18n/locales/en"
import { HStack, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"

import { requestApi } from "utils/axios/request"
import { FaEye, FaUser } from "react-icons/fa"
import { User } from "types/user"
import moment from "moment"
import useSession from "hooks/use-session"

export const AdminUserStats = memo(() => {
    const { session } = useSession()
    const t = useStore(commonMsg)
    const [users, setUsers] = useState<User[]>([])
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/admin/users")
        setUsers(res.data)
    }


    return <Page title={t.Admin} subTitle={t.manageItem({ name: t.userStats })} icon={<FaUser />} tabs={adminLinks}>
        <TableContainer mt="2">
            <Table variant="simple" size="sm">
                <Thead>
                    <Tr>
                        <Th>{t.userName}</Th>
                        <Th>{t.nickname}</Th>
                        <Th>{t.joined}</Th>
                        <Th>Last seen at</Th>
                        <Th>Visit count</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map(user => {
                        return <Tr key={user.id}>
                            <Td>
                                <HStack>
                                    <span>
                                        {user.username}
                                    </span>  {session?.user?.id == user.id && <Tag size={"sm"}>You</Tag>}
                                </HStack>
                            </Td>
                            <Td>{user.name}</Td>
                            <Td>{moment(user.created).fromNow()}</Td>
                            <Td>{user.lastSeenAt && moment(user.lastSeenAt).fromNow()}</Td>
                            <Th>{user.visits ?? 0}</Th>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    </Page >
})

export default AdminUserStats