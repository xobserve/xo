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

import React from "react"
import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Modal, ModalBody, ModalCloseButton, ModalContent, HStack, ModalHeader, ModalOverlay, Text, RadioGroup, Stack, Radio, useToast, VStack, Box, Input, Flex, Tag } from "@chakra-ui/react"
import { Form, FormSection } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import useSession from "hooks/use-session"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { FaCog } from "react-icons/fa"
import { adminLinks } from "src/data/nav-links"
import { Role, SuperAdminId } from "types/role"
import { User } from "types/user"
import { requestApi } from "utils/axios/request"
import isEmail from "validator/lib/isEmail"
import { useStore } from "@nanostores/react"
import { cfgUsers, commonMsg } from "src/i18n/locales/en"
import { isEmpty } from "utils/validate"

const AdminUsers = () => {
    const t = useStore(commonMsg)
    const t1 = useStore(cfgUsers)
    const { session } = useSession()
    const toast = useToast()
    const [users, setUsers] = useState<User[]>(null)
    useEffect(() => {
        load()
    }, [])

    const [userInEdit, setUserInEdit] = useState<User>()
    const [password, setPassword] = useState<string>('')

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()

    const cancelRef = useRef()

    const load = async () => {
        const res = await requestApi.get("/admin/users")
        setUsers(res.data)
    }

    const editUser = (m: User) => {
        setUserInEdit(cloneDeep(m))
        onOpen()
    }

    const onDeleteUser = () => {
        onAlertOpen()
    }

    const updateUser = async () => {
        if (!isEmpty(userInEdit.email) && !isEmail(userInEdit.email)) {
            toast({
                description: t.isInvalid({ name: t.email }),
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        // if (!userInEdit.name) {
        //     toast({
        //         description: t.isInvalid({name: t.name}),
        //         status: "warning",
        //         duration: 2000,
        //         isClosable: true,
        //     });
        //     return
        // }

        await requestApi.post(`/admin/user`, userInEdit)
        toast({
            title: t.isUpdated({ name: t.user }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        load()
    }

    const updatePassword = async () => {
        if (password.length < 5) {
            toast({
                description: t1.pwAlert,
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }
        await requestApi.post(`/admin/user/password`, { id: userInEdit.id, password })
        toast({
            title: t.isUpdated({ name: t.user }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const deleteUser = async () => {
        await requestApi.delete(`/admin/user/${userInEdit.id}`)
        toast({
            title: t.isDeleted({ name: t.user }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setUserInEdit(null)
        onAlertClose()
        onClose()

        load()
    }

    const addUser = async () => {
        // if (!userInEdit.email || !isEmail(userInEdit.email)) {
        //     toast({
        //         description:  t.isInvalid({name: t.email}),
        //         status: "warning",
        //         duration: 2000,
        //         isClosable: true,
        //     });
        //     return
        // }


        const res = await requestApi.post(`/admin/user/new`, userInEdit)
        toast({
            title: t.isAdded({ name: t.user }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        onAddClose()
        setUserInEdit(null)
        users.unshift(res.data)
        setUsers(cloneDeep(users))
    }

    const onAddUser = () => {
        setUserInEdit({ role: Role.Viewer } as any)
        onAddOpen()
    }

    const updateUserRole = async (v) => {
        userInEdit.role = v as Role;
        setUserInEdit(cloneDeep(userInEdit))

        await requestApi.post(`/admin/user/role`, { id: userInEdit.id, role: v })
        toast({
            title: t.isUpdated({ name: t1.userRole }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        load()
    }

    return <>
        <Page title={t.configuration} subTitle={t.manageItem({ name: t.user })} icon={<FaCog />} tabs={adminLinks} isLoading={users === null}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddUser}>{t.newItem({ name: t.user })}</Button>
            </Flex>

            <TableContainer mt="2">
                <Table variant="simple" size="sm" className="color-border-table">
                    <Thead>
                        <Tr>
                            <Th>{t.userName}</Th>
                            <Th>{t.nickname}</Th>
                            <Th>{t.email}</Th>
                            <Th>{t.joined}</Th>
                            <Th>{t1.globalRole}</Th>
                            <Th>{t.action}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users?.map(user => {
                            return <Tr key={user.id}>
                                <Td>
                                    <HStack>
                                        <span>
                                            {user.username}
                                        </span>  {session?.user?.id == user.id && <Tag size={"sm"}>You</Tag>}
                                    </HStack>
                                </Td>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>{moment(user.created).fromNow()}</Td>
                                <Td>{t[user.role]}</Td>
                                <Td>
                                    <Button variant="ghost" size="sm" px="0" onClick={() => editUser(user)}>{t.edit}</Button>
                                </Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Page>
        <Modal isOpen={isOpen} onClose={() => { setUserInEdit(null); onClose() }}>
            <ModalOverlay />
            {userInEdit && <ModalContent>
                <ModalHeader>{t.editItem({ name: t.user })} - {userInEdit.username}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Form pb="5">
                        <FormSection title={t.basicSetting}>
                            <FormItem title={t.email}>
                                <Input type='email' placeholder={t.inputTips({ name: t.email })} value={userInEdit.email} onChange={e => { userInEdit.email = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>
                            <FormItem title={t.nickname}>
                                <Input placeholder={t.inputTips({ name: t.nickname })} value={userInEdit.name} onChange={e => { userInEdit.name = e.currentTarget.value; setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>

                            <Button width="fit-content" onClick={updateUser}>{t.submit}</Button>
                        </FormSection>
                        <FormSection title={t1.changePw}>
                            <FormItem title={t.password}>
                                <Input placeholder={t.inputTips({ name: t.password })} value={password} onChange={e => setPassword(e.currentTarget.value.trim())} />
                            </FormItem>
                            <Button width="fit-content" onClick={updatePassword}>{t.submit}</Button>
                        </FormSection>

                        <FormSection title={t1.globalRole}>
                            <RadioGroup mt="1" onChange={updateUserRole} value={userInEdit.role} isDisabled={userInEdit.id == SuperAdminId}>
                                <Stack direction='row'>
                                    <Radio value={Role.Viewer}>{t[Role.Viewer]}</Radio>
                                    <Radio value={Role.ADMIN}>{t[Role.ADMIN]}</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormSection>

                        <FormSection title={t.dangeSection}>
                            <Button width="fit-content" onClick={onDeleteUser} colorScheme="red">{t.deleteItem({ name: t.user })}</Button>
                        </FormSection>
                    </Form>

                </ModalBody>
            </ModalContent>}
        </Modal>
        <Modal isOpen={isAddOpen} onClose={() => { setUserInEdit(null); onAddClose() }}>
            <ModalOverlay />
            {userInEdit && <ModalContent>
                <ModalHeader>{t.newItem({ name: t.user })}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack alignItems="left" spacing="6" pb="5">
                        <Form sx={{
                            '.form-item-label': {
                                width: "80px"
                            }
                        }}>
                            <FormItem title={t.userName}>
                                <Input placeholder={t1.userNameInput} value={userInEdit.username} onChange={e => { userInEdit.username = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>
                            <FormItem title={t.email}>
                                <Input type='email' placeholder={t.inputTips({ name: t.email })} value={userInEdit.email} onChange={e => { userInEdit.email = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>

                            <FormItem title={t.password} >
                                <Input placeholder={t.inputTips({ name: t.password })} value={userInEdit.password} onChange={e => { userInEdit.password = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>

                            <FormItem title={t1.globalRole}>
                                <RadioGroup mt="3" onChange={(v) => { userInEdit.role = v as Role; setUserInEdit(cloneDeep(userInEdit)) }} value={userInEdit.role}>
                                    <Stack direction='row'>
                                        <Radio value={Role.Viewer}>{t[Role.Viewer]}</Radio>
                                        <Radio value={Role.ADMIN}>{t[Role.ADMIN]}</Radio>
                                    </Stack>
                                </RadioGroup>
                            </FormItem>
                            <Button width="fit-content" onClick={addUser}>{t.submit}</Button>
                        </Form>
                    </VStack>
                </ModalBody>
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
                        {t.deleteItem({ name: t.user })} - {userInEdit?.username}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {t.deleteAlert}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onAlertClose}>
                            {t.cancel}
                        </Button>
                        <Button colorScheme='red' onClick={deleteUser} ml={3}>
                            {t.delete}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
}


export default AdminUsers
