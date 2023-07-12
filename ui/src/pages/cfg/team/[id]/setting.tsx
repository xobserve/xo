import React from "react"
import { Box, Button, Input, useDisclosure, useToast, VStack, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, HStack, FormLabel } from "@chakra-ui/react"
import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import { useEffect, useRef, useState } from "react"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { Route } from "types/route"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { useNavigate, useParams } from "react-router-dom"

const TeamSettingPage = () => {
  const params = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const id = params.id
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
  const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure()
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
      navigate(`/cfg/teams`)
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
      navigate(`/cfg/teams`)
    }, 1000)
  }

  return <>
    {id && <Page title={`Manage your team`} subTitle={`Current team - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
      {team && <Form width="500px">
        <FormSection title="Basic setting">
          <FormItem title='Team name'>
            <Input placeholder="******" value={team.name} onChange={e => { team.name = e.currentTarget.value; setTeam(cloneDeep(team)) }} />
          </FormItem>
          <Button width="fit-content" onClick={updateTeam}>Submit</Button>
        </FormSection>

        <FormSection title="Dangerous section">
          <HStack>
            <Button width="fit-content" onClick={onOpen} colorScheme="red">Delete team</Button>
            {/* <Button width="fit-content" onClick={onLeaveOpen} colorScheme="orange">Leave team</Button> */}
          </HStack>
        </FormSection>
      </Form>}
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