import React from "react"
import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure,  Input, Flex, Box, useToast } from "@chakra-ui/react"
import { Form } from "components/form/Form"
import FormItem from "components/form/Item"
import useSession from "hooks/use-session"
import Page from "layouts/page/Page"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaCog } from "react-icons/fa"
import { cfgLinks } from "src/data/nav-links"
import ReserveUrls from "src/data/reserve-urls"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"

const TeamsPage = () => {
    const { session } = useSession()
    const toast = useToast()
    const router = useRouter()
    const [teams, setTeams] = useState<Team[]>([])
    const [teamName, setTeamName] = useState<string>("")
    const [teamDesc, setTeamDesc] = useState<string>("")
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/teams/all")
        setTeams(res.data)
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    const addTeam = async () => {
        const res = await requestApi.post("/team/new", { name: teamName.trim(),brief: teamDesc.trim()})
        onClose()
        toast({
            title: "Team added",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        teams.unshift(res.data)
        setTeams([...teams])
    }

    return <>
        <Page title={`Configuration`} subTitle="Manage teams" icon={<FaCog />} tabs={cfgLinks}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onOpen}>Add new team</Button>
            </Flex>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Team name</Th>
                            <Th>Members</Th>
                            <Th>Created by</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {teams.map(team => {
                            return <Tr key={team.id}>
                                <Td>{team.name}</Td>
                                <Td>{team.memberCount}</Td>
                                <Td>{team.createdBy} {session?.user?.id == team.createdById && <Tag>You</Tag>}</Td>
                                <Td><Button variant="ghost" size="sm" px="0" onClick={() => router.push(`${ReserveUrls.Config}/team/${team.id}/members`)}>Manage</Button></Td>
                            </Tr>
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Page>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add new team</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <Form alignItems="left" spacing={2}>
                        <FormItem title='Team name' labelWidth="130px">
                            <Input placeholder='enter a team name' value={teamName} onChange={e => { setTeamName(e.currentTarget.value) }} />
                        </FormItem>
                        <FormItem title='Team description'  labelWidth="130px">
                            <Input placeholder='give a short description to this team' value={teamDesc} onChange={e => { setTeamDesc(e.currentTarget.value) }} />
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