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

import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import { cloneDeep } from "lodash"
import moment from "moment"
import React, { useEffect, useRef, useState } from "react"
import { cfgTeam, commonMsg } from "src/i18n/locales/en"
import { Role } from "types/role"
import { Team, TeamMember } from "types/teams"
import { requestApi } from "utils/axios/request"
import Loading from "src/components/loading/Loading"




const TeamMembers = ({team}: {team: Team}) => {
    const t = useStore(commonMsg)
    const t1 = useStore(cfgTeam)
    const toast = useToast()

    const [members, setMembers] = useState<TeamMember[]>(null)
    const [memberInEdit, setMemberInEdit] = useState<TeamMember>(null)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()

    const cancelRef = useRef()

    useEffect(() => {
            load()
    }, [])

    const load = async () => {
        const res1 = await requestApi.get(`/team/${team.id}/members`)
        setMembers(res1.data)
    }

    const editTeamMember = (m) => {
        setMemberInEdit(m)
        onOpen()
    }

    const onDeleteMember = (m) => {
        setMemberInEdit(m)
        onAlertOpen()
    }

    const updateTeamMember = async () => {
        await requestApi.post(`/team/member`, memberInEdit)
        toast({
            title: t.isUpdated({ name: t.members }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setMemberInEdit(null)
        onClose()
    }

    const deleteTeamMember = async () => {
        await requestApi.delete(`/team/member/${memberInEdit.teamId}/${memberInEdit.id}`)
        toast({
            title: t.isDeleted({name: t.members}),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setMemberInEdit(null)
        load()
        onAlertClose()
    }

    const onAddMemberOpen = () => {
        setMemberInEdit({ role: Role.Viewer } as any)
        onAddOpen()
    }

    const addMember = async () => {
        await requestApi.post(`/team/add/member`, { teamId: team.id, members: [memberInEdit.username], role: memberInEdit.role })
        toast({
            title: t.isAdded({ name: t.members }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setMemberInEdit(null)
        onAddClose()
        load()
    }

    return <>
        <Box>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddMemberOpen}>{t.newItem({name: t.members})}</Button>
            </Flex>
            {members ? <TableContainer>
                <Table variant="simple" className="color-border-table">
                    <Thead>
                        <Tr>
                            <Th>{t.userName}</Th>
                            <Th>{t.role}</Th>
                            <Th>{t.joined}</Th>
                            <Th>{t.action}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {members.map(member => {
                            return <Tr key={member.id}>
                                <Td>{member.username}</Td>
                                <Td>{member.role}</Td>
                                <Td>{moment(member.created).fromNow()}</Td>
                                <Td>
                                    <Button variant="ghost" size="sm" px="0" onClick={() => editTeamMember(member)}>{t.edit}</Button>
                                    <Button variant="ghost" size="sm" colorScheme="orange" onClick={() => onDeleteMember(member)}>{t.delete}</Button>
                                </Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>:  <Loading style={{marginTop: '50px'}}/>}
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            {memberInEdit && <ModalContent>
                <ModalHeader>Edit team member - {memberInEdit.username}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Role in team</Text>
                    <RadioGroup mt="3" onChange={(v) => { memberInEdit.role = v as Role; setMemberInEdit(cloneDeep(memberInEdit)) }} value={memberInEdit.role}>
                        <Stack direction='row'>
                            <Radio value={Role.Viewer}>{Role.Viewer}</Radio>
                            <Radio value={Role.ADMIN}>{Role.ADMIN}</Radio>
                        </Stack>
                    </RadioGroup>
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant='ghost' onClick={updateTeamMember}>Submit</Button>
                </ModalFooter>
            </ModalContent>}
        </Modal>

        <Modal isOpen={isAddOpen} onClose={onAddClose}>
            <ModalOverlay />
            {memberInEdit && <ModalContent>
                <ModalHeader>{t.newItem({name: t.members})}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>{t.userName}</Text>
                    <Input mt="3" width="300px" value={memberInEdit.username} onChange={e => { memberInEdit.username = e.currentTarget.value.trim(); setMemberInEdit({ ...memberInEdit }) }} />


                    <Text mt="3">{t1.roleInTeam} </Text>
                    <RadioGroup mt="3" onChange={(v) => { memberInEdit.role = v as Role; setMemberInEdit(cloneDeep(memberInEdit)) }} value={memberInEdit.role}>
                        <Stack direction='row'>
                            <Radio value={Role.Viewer}>{t[Role.Viewer]}</Radio>
                            <Radio value={Role.ADMIN}>{t[Role.ADMIN]}</Radio>
                        </Stack>
                    </RadioGroup>
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={onAddClose}>
                        {t.cancel}
                    </Button>
                    <Button variant='ghost' onClick={addMember}>{t.submit}</Button>
                </ModalFooter>
            </ModalContent>}
        </Modal>

        <AlertDialog
            isOpen={isAlertOpen}
            onClose={onAlertClose}
            leastDestructiveRef={cancelRef}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete Member - {memberInEdit?.username}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onAlertClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='orange' onClick={deleteTeamMember} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
}

export default TeamMembers
