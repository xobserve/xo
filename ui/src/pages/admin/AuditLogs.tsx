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
import { MdOutlineAdminPanelSettings } from "react-icons/md"
import { Box, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Table, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr, VStack } from "@chakra-ui/react"


import { requestApi } from "utils/axios/request"
import { AuditLog } from "types/admin"
import { FaEye } from "react-icons/fa"
import { dateTimeFormat } from "utils/datetime/formatter"
import { prettyJson } from "utils/string"
import CodeEditor from "src/components/CodeEditor/CodeEditor"
export const AdminAuditLogs = memo(() => {
    const t = useStore(commonMsg)
    const [logs, setLogs] = useState<AuditLog[]>(null)

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/admin/auditlogs")
        for (const r of res.data) {
            r.data = JSON.parse(r.data)
        }
        setLogs(res.data)
    }


    return <Page title={t.Admin} subTitle={t.manageItem({ name: t.auditLog })} icon={<MdOutlineAdminPanelSettings />} tabs={adminLinks}>
        <TableContainer>
            <Table variant='simple' size={"sm"}>
                <Thead>
                    <Tr>
                        <Th>Type</Th>
                        <Th>Operator</Th>
                        <Th>Target</Th>
                        <Th>Data</Th>
                        <Th>Date</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        logs?.map(log => <Tr>
                            <Td>{log.opType}</Td>
                            <Td>{log.opId} / {log.op.username}</Td>
                            <Td>{log.targetId}</Td>
                            <Td><Popover>
                                <PopoverTrigger>
                                    <Box cursor="pointer"><FaEye /></Box>
                                </PopoverTrigger>
                                <PopoverContent width="500px">
                                    <PopoverArrow />
                                    <PopoverBody height="400px" width="500px"><CodeEditor value={prettyJson(log.data)} readonly /></PopoverBody>
                                </PopoverContent>
                            </Popover>
                            </Td>
                            <Td>{dateTimeFormat(log.created)}</Td>
                        </Tr>)
                    }

                </Tbody>
            </Table>
        </TableContainer>
    </Page>
})

export default AdminAuditLogs