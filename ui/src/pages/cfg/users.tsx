import React from "react"
import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, RadioGroup, Stack, Radio, useToast, VStack, Box, Input, Flex, Tag } from "@chakra-ui/react"
import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import useSession from "hooks/use-session"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import moment from "moment"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { FaCog } from "react-icons/fa"
import { cfgLinks } from "src/data/nav-links"
import ReserveUrls from "src/data/reserve-urls"
import { Role, SuperAdminId } from "types/role"
import { User } from "types/user"
import { requestApi } from "utils/axios/request"
import isEmail from "validator/lib/isEmail"

const UsersPage = () => {
    const {session} = useSession()
    const toast = useToast()
    const [users, setUsers] = useState<User[]>([])
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

    const editUser = (m) => {
        setUserInEdit(m)
        onOpen()
    }

    const onDeleteUser = () => {
        onAlertOpen()
    }

    const updateUser = async () => {
        if (!userInEdit.email || !isEmail(userInEdit.email)) {
            toast({
                description: "email format is incorrect",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        if (!userInEdit.name) {
            toast({
                description: "name cannot be empty",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        await requestApi.post(`/admin/user`, userInEdit)
        toast({
            title: "User updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const updatePassword = async () => {
        if (password.length < 5) {
            toast({
                description: "new password must be at least 6 characters long",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }
        await requestApi.post(`/admin/user/password`, {id: userInEdit.id, password })
        toast({
            title: "User updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const deleteUser = async () => {
        await requestApi.delete(`/admin/user/${userInEdit.id}`)
        toast({
            title: "User deleted!",
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
        if (!userInEdit.email || !isEmail(userInEdit.email)) {
            toast({
                description: "email format is incorrect",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }


        const res = await requestApi.post(`/admin/user/new`, userInEdit)
        toast({
            title: "User added!",
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
        setUserInEdit({role: Role.Viewer} as any)
        onAddOpen()
    }

    const updateUserRole = async (v) => {
        userInEdit.role = v as Role; 
        setUserInEdit(cloneDeep(userInEdit))

        await requestApi.post(`/admin/user/role`, { id: userInEdit.id, role: v })
        toast({
            title: "User role updated!",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    return <>
        <Page title={`Configuration`} subTitle="Manage users" icon={<FaCog />} tabs={cfgLinks}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddUser}>Add new user</Button>
            </Flex>
           
            <TableContainer mt="2">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Username</Th>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Joined</Th>
                            <Th>Global role</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.map(user => {
                            return <Tr key={user.id}>
                                <Td>{user.username} {session?.user?.id == user.id && <Tag>You</Tag>}</Td>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>{moment(user.created).fromNow()}</Td>
                                <Td>{user.role}</Td>
                                <Td>
                                    <Button variant="ghost" size="sm" px="0" onClick={() => editUser(user)}>Edit</Button>
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
                <ModalHeader>Edit user - {userInEdit.username}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Form  pb="5">
                        <FormSection title="Basic information">
                            <FormItem title='Email'>
                                <Input type='email' placeholder='enter a valid email' value={userInEdit.email} onChange={e => { userInEdit.email = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>
                            <FormItem title='Nick name'>
                                <Input placeholder='enter a nick  name' value={userInEdit.name} onChange={e => { userInEdit.name = e.currentTarget.value; setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>

                            <Button width="fit-content" onClick={updateUser}>Submit</Button>
                        </FormSection>
                        <FormSection title="Change password">
                            <FormItem  title='password'>
                                <Input placeholder='enter a password' value={password} onChange={e => setPassword(e.currentTarget.value.trim())} />
                            </FormItem>
                            <Button width="fit-content" onClick={updatePassword}>Submit</Button>
                        </FormSection>

                        <FormSection title="Global role">
                            <RadioGroup mt="3" onChange={updateUserRole} value={userInEdit.role} isDisabled={userInEdit.id == SuperAdminId}>
                                <Stack direction='row'>
                                    <Radio value={Role.Viewer}>{Role.Viewer}</Radio>
                                    <Radio value={Role.ADMIN}>{Role.ADMIN}</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormSection>

                        <FormSection title="Dangerous section">
                            <Button width="fit-content" onClick={onDeleteUser} colorScheme="red">Delete user</Button>
                        </FormSection>
                    </Form>

                </ModalBody>
            </ModalContent>}
        </Modal>
        <Modal isOpen={isAddOpen} onClose={() => {setUserInEdit(null);onAddClose()}}>
            <ModalOverlay />
            {userInEdit && <ModalContent>
                <ModalHeader>Add new user</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack alignItems="left" spacing="6" pb="5">
                        <Form sx={{
                            '.form-item-label': {
                                width: "80px"
                            }
                        }}>
                            <FormItem title='Username'>
                                <Input placeholder='enter a username, used in login' value={userInEdit.username} onChange={e => { userInEdit.username = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>
                            <FormItem title='Email'>
                                <Input type='email' placeholder='enter a valid email' value={userInEdit.email} onChange={e => { userInEdit.email = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>

                            <FormItem title='Password' >
                                <Input placeholder='enter a password' value={userInEdit.password} onChange={e => { userInEdit.password = e.currentTarget.value.trim(); setUserInEdit(cloneDeep(userInEdit)) }} />
                            </FormItem>

                            <FormItem title='Global role'>
                                <RadioGroup mt="3" onChange={(v) => { userInEdit.role = v as Role; setUserInEdit(cloneDeep(userInEdit)) }} value={userInEdit.role}>
                                    <Stack direction='row'>
                                        <Radio value={Role.Viewer}>{Role.Viewer}</Radio>
                                        <Radio value={Role.ADMIN}>{Role.ADMIN}</Radio>
                                    </Stack>
                                </RadioGroup>
                            </FormItem>
                            <Button width="fit-content" onClick={addUser}>Submit</Button>
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
                        Delete User - {userInEdit?.username}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onAlertClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={deleteUser} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
}


export default UsersPage