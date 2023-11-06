// Copyright 2023 ObserveX.io Team
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
import React from "react"
import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure,  Input, Flex, Box, useToast } from "@chakra-ui/react"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import useSession from "hooks/use-session"
import Page from "layouts/page/Page"
import { useEffect, useState } from "react"
import { FaCog } from "react-icons/fa"
import { cfgLinks } from "src/data/nav-links"
import ReserveUrls from "src/data/reserve-urls"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { useNavigate } from "react-router-dom"
import { commonMsg } from "src/i18n/locales/en"
import { useStore } from "@nanostores/react"
import { $teams } from "src/views/team/store"

const TeamsPage = () => {
    const t = useStore(commonMsg)
    const { session } = useSession()
    const toast = useToast()
    const navigate = useNavigate()
    const [teamName, setTeamName] = useState<string>("")
    const [teamDesc, setTeamDesc] = useState<string>("")
    const teams = useStore($teams)


    const { isOpen, onOpen, onClose } = useDisclosure()

    const addTeam = async () => {
        const res = await requestApi.post("/team/new", { name: teamName.trim(),brief: teamDesc.trim()})
        onClose()
        toast({
            title: t.isAdded({name: t.team}),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        teams.unshift(res.data)
        $teams.set([...teams])
    }

    return <>
        <Page title={t.configuration} subTitle={t.manageItem({name: t.team})} icon={<FaCog />} tabs={cfgLinks} isLoading={teams === null}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onOpen}>{t.newItem({name: t.team})}</Button>
            </Flex>
            <TableContainer>
                <Table variant="simple" className="color-border-table">
                    <Thead>
                        <Tr>
                            <Th>Id</Th>
                            <Th>{t.itemName({name: t.team})}</Th>
                            <Th>{t.yourRole}</Th>
                            <Th>{t.members}</Th>
                            <Th>{t.public}</Th>
                            <Th>{t.createdBy}</Th>
                            <Th>{t.action}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {teams?.map(team => {
                            return <Tr key={team.id}>
                                <Td>{team.id}</Td>
                                <Td>{team.name}</Td>
                                <Td>{t[team.role] }</Td>
                                <Td>{team.memberCount}</Td>
                                <Td>{team.isPublic ? "true" : "false"}</Td>
                                <Td>{team.createdBy} {session?.user?.id == team.createdById && <Tag>You</Tag>}</Td>
                                <Td><Button variant="ghost" size="sm" px="0" onClick={() => navigate(`${ReserveUrls.Config}/team/${team.id}/members`)}>{t.manage}</Button></Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Page>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t.newItem({name: t.team})}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <Form alignItems="left" spacing={2}>
                        <FormItem title={t.itemName({name: t.team})} labelWidth="130px">
                            <Input placeholder={t.inputTips({name: t.name})} value={teamName} onChange={e => { setTeamName(e.currentTarget.value) }} />
                        </FormItem>
                        <FormItem title={t.description}  labelWidth="130px">
                            <Input placeholder={t.inputTips({name: t.description})} value={teamDesc} onChange={e => { setTeamDesc(e.currentTarget.value) }} />
                        </FormItem>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant='ghost' onClick={addTeam}>Submit</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
}


export default TeamsPage
