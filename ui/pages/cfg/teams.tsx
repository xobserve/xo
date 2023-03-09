import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, VStack, InputGroup, InputLeftAddon, Input, Flex, Box, useToast } from "@chakra-ui/react"
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
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/teams/all")
        setTeams(res.data)
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    const addTeam = async () => {
        const res = await requestApi.post("/team/new", { name: teamName })
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
                <ModalHeader>Add new user</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <VStack alignItems="left" spacing="3">
                        <InputGroup>
                            <InputLeftAddon children='Team name' />
                            <Input placeholder='enter a team name' value={teamName} onChange={e => { setTeamName(e.currentTarget.value.trim()) }} />
                        </InputGroup>

                    </VStack>
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