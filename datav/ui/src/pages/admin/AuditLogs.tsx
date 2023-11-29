// Copyright 2023 xObserve.io Team

import { useStore } from '@nanostores/react'
import Page from 'layouts/page/Page'
import React, { memo, useEffect, useState } from 'react'
import { commonMsg, websiteAdmin } from 'src/i18n/locales/en'
import { MdOutlineAdminPanelSettings } from 'react-icons/md'
import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
} from '@chakra-ui/react'

import { requestApi } from 'utils/axios/request'
import { AuditLog } from 'types/admin'
import { FaEye } from 'react-icons/fa'
import { dateTimeFormat } from 'utils/datetime/formatter'
import { prettyJson } from 'utils/string'
import CodeEditor from 'src/components/CodeEditor/CodeEditor'
import { useParams } from 'react-router-dom'
import { getAdminLinks } from './links'
export const AdminAuditLogs = memo(() => {
  const t = useStore(commonMsg)
  const t1 = useStore(websiteAdmin)

  const [logs, setLogs] = useState<AuditLog[]>(null)
  const teamId = useParams().teamId
  const adminLinks = getAdminLinks(teamId)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await requestApi.get('/admin/auditlogs')
    for (const r of res.data) {
      r.data = JSON.parse(r.data)
    }
    setLogs(res.data)
  }

  return (
    <Page
      title={t1.websiteAdmin}
      subTitle={t.manageItem({ name: t.auditLog })}
      icon={<MdOutlineAdminPanelSettings />}
      tabs={adminLinks}
    >
      <TableContainer>
        <Table variant='simple' size={'sm'} className='color-border-table'>
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
            {logs?.map((log) => (
              <Tr>
                <Td>{log.opType}</Td>
                <Td>
                  {log.opId} / {log.op.username}
                </Td>
                <Td>{log.targetId}</Td>
                <Td>
                  <Popover>
                    <PopoverTrigger>
                      <Box cursor='pointer'>
                        <FaEye />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent width='500px'>
                      <PopoverArrow />
                      <PopoverBody height='400px' width='500px'>
                        <CodeEditor value={prettyJson(log.data)} readonly />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Td>
                <Td>{dateTimeFormat(log.created)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Page>
  )
})

export default AdminAuditLogs
