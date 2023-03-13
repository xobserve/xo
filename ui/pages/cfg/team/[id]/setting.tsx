import { Box, Button, Input, InputGroup, InputLeftAddon, useDisclosure, useToast, VStack,AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, HStack } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { Route } from "types/route"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"

const TeamSettingPage = () => {
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


    useEffect(() => {
        if (id) {
            load()
        }
    }, [id])

    const load = async () => {
        const res = await requestApi.get(`/team/${id}`)
        setTeam(res.data)
    }

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen:isLeaveOpen, onOpen:onLeaveOpen, onClose:onLeaveClose } = useDisclosure()
    const cancelRef = useRef()

    const updateTeam = async () => {
        await requestApi.post(`/team/update`, team)
        toast({
            title: "Member updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const deleteTeam = async () => {
        await requestApi.delete(`/team/${team.id}`)
        toast({
            title: "Team deleted!",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            router.push(`/cfg/teams`)
        }, 1000)
    }

    const leaveTeam = async () => {
        await requestApi.delete(`/team/leave/${team.id}`)
        toast({
            title: "Team leaved!",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            router.push(`/cfg/teams`)
        }, 1000)
    }

    return <>
        {id && <Page title={`Manage your team`} subTitle={`Current team - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
            {team && <VStack alignItems="left" spacing="6">
                <VStack alignItems="left" spacing="4">
                    <Box textStyle="subTitle">Basic setting</Box>
                    <InputGroup>
                        <InputLeftAddon children='Team name' />
                        <Input width="300px" placeholder="******" value={team.name} onChange={e => {team.name = e.currentTarget.value; setTeam(cloneDeep(team))}} />
                    </InputGroup>
                    <Button width="fit-content" onClick={updateTeam}>Submit</Button>
                </VStack>

                <VStack alignItems="left" spacing="4">
                            <Box textStyle="subTitle">Dangerous section</Box>
                            <HStack>
                                <Button width="fit-content" onClick={onOpen} colorScheme="red">Delete team</Button>
                                {/* <Button width="fit-content" onClick={onLeaveOpen} colorScheme="orange">Leave team</Button> */}
                            </HStack>
                        </VStack>
            </VStack>}
        </Page>}

        <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          {team && <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Team - {team.name}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='orange' onClick={deleteTeam} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>}
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isLeaveOpen}
        onClose={onLeaveClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          {team && <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Leave Team - {team.name}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onLeaveClose}>
                Cancel
              </Button>
              <Button colorScheme='orange' onClick={leaveTeam} ml={3}>
                Leave
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>}
        </AlertDialogOverlay>
      </AlertDialog>
    </>
}

export default TeamSettingPage