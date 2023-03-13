import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, Input, InputGroup, InputLeftAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import moment from "moment"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { Role } from "types/role"
import { Route } from "types/route"
import { Team, TeamMember } from "types/teams"
import { requestApi } from "utils/axios/request"

const TeamMembersPage = () => {
    const router = useRouter()
    const toast = useToast()
    const id = router.query.id
    const tabLinks: Route[] = [
        { title: "Members", url: `/cfg/team/${id}/members`, icon: <FaUserFriends /> },
        { title: "Dashboards", url: `/cfg/team/${id}/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "Side menu", url: `/cfg/team/${id}/sidemenu`, icon: <FaAlignLeft /> },
        { title: "Setting", url: `/cfg/team/${id}/setting`, icon: <FaCog /> },
    ]

    const [team, setTeam] = useState<Team>(null)
    const [members, setMembers] = useState<TeamMember[]>([])
    const [memberInEdit, setMemberInEdit] = useState<TeamMember>(null)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()

    const cancelRef = useRef()

    useEffect(() => {
        if (id) {
            load()
        }
    }, [id])

    const load = async () => {
        const res = await requestApi.get(`/team/${id}`)
        setTeam(res.data)
        const res1 = await requestApi.get(`/team/${id}/members`)
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
            title: "Member updated",
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
            title: "Member deleted",
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
            title: "Member added",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setMemberInEdit(null)
        onAddClose()
        load()
    }

    return <>
        {id && <Page title={`Manage your team`} subTitle={`Current team - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddMemberOpen}>Add team member</Button>
            </Flex>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Username</Th>
                            <Th>Role</Th>
                            <Th>Joined</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {members.map(member => {
                            return <Tr key={member.id}>
                                <Td>{member.username}</Td>
                                <Td>{member.role}</Td>
                                <Td>{moment(member.created).fromNow()}</Td>
                                <Td>
                                    <Button variant="ghost" size="sm" px="0" onClick={() => editTeamMember(member)}>Edit</Button>
                                    <Button variant="ghost" size="sm" colorScheme="orange" onClick={() => onDeleteMember(member)}>Delete</Button>
                                </Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Page>}

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
                <ModalHeader>Invide a team member</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Username</Text>
                    <Input mt="3" width="300px" value={memberInEdit.username} onChange={e => { memberInEdit.username = e.currentTarget.value.trim(); setMemberInEdit({ ...memberInEdit }) }} />


                    <Text mt="3">Role in team</Text>
                    <RadioGroup mt="3" onChange={(v) => { memberInEdit.role = v as Role; setMemberInEdit(cloneDeep(memberInEdit)) }} value={memberInEdit.role}>
                        <Stack direction='row'>
                            <Radio value={Role.Viewer}>{Role.Viewer}</Radio>
                            <Radio value={Role.ADMIN}>{Role.ADMIN}</Radio>
                        </Stack>
                    </RadioGroup>
                </ModalBody>

                <ModalFooter>
                    <Button mr={3} onClick={onAddClose}>
                        Close
                    </Button>
                    <Button variant='ghost' onClick={addMember}>Submit</Button>
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

export default TeamMembersPage