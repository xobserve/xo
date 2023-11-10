// Copyright 2023 xObserve.io Team
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
import { commonMsg, websiteAdmin } from "src/i18n/locales/en"
import { HStack, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"

import { requestApi } from "utils/axios/request"
import { FaEye, FaUser } from "react-icons/fa"
import { User } from "types/user"
import moment from "moment"
import useSession from "hooks/use-session"
import { Tenant } from "types/tenant"

export const AdminTenants = memo(() => {
    const { session } = useSession()
    const t = useStore(commonMsg)
    const t1 = useStore(websiteAdmin)
    const [tenants, setTenants] = useState<Tenant[]>([])
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/tenant/list/all")
        setTenants(res.data)
    }


    return <Page title={t1.websiteAdmin} subTitle={t.manageItem({ name: t.tenant })} icon={<FaUser />} tabs={adminLinks}>
        <TableContainer mt="2">
            <Table variant="simple" size="sm" className="color-border-table">
                <Thead>
                    <Tr>
                        <Th>{t.name}</Th>
                        <Th>Owner</Th>
                        <Th>{t.created}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tenants.map(tenant => {
                        return <Tr key={tenant.id}>
                            <Td>{tenant.name}</Td>
                            <Td>
                                <HStack>
                                    <span>
                                        {tenant.owner}
                                    </span>  {session?.user?.id == tenant.ownerId && <Tag size={"sm"}>You</Tag>}
                                </HStack>
                            </Td>
                            <Td>{moment(tenant.created).fromNow()}</Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    </Page >
})

export default AdminTenants