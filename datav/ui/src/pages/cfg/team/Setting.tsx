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
import { Box, Button, Input, useDisclosure, useToast, VStack, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, HStack, FormLabel, Switch } from "@chakra-ui/react"
import { Form, FormSection } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep } from "lodash"
import { useRef, useState } from "react"
import { Team, globalTeamId } from "types/teams"
import { requestApi } from "utils/axios/request"
import { useNavigate } from "react-router-dom"
import { useStore } from "@nanostores/react"
import { cfgTeam, commonMsg } from "src/i18n/locales/en"
import { $teams } from "src/views/team/store"

const TeamSettings = (props: { team: Team }) => {
  const t = useStore(commonMsg)
  const t1 = useStore(cfgTeam)
  const [team, setTeam] = useState<Team>(props.team)
  const navigate = useNavigate()
  const toast = useToast()




  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure()
  const cancelRef = useRef()

  const updateTeam = async () => {
    await requestApi.post(`/team/update`, team)
    toast({
      title: t.isUpdated({ name: t.team }),
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const deleteTeam = async () => {
    await requestApi.delete(`/team/${team.id}`)
    toast({
      title: t.isDeleted({ name: t.team }),
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    const teams = $teams.get().filter(t => t.id != team.id)
    $teams.set(teams)
    setTimeout(() => {
      navigate(`/cfg/teams`)
    }, 1000)
  }

  const leaveTeam = async () => {
    await requestApi.delete(`/team/leave/${team.id}`)
    toast({
      title: t1.leaveTeam,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      navigate(`/cfg/teams`)
    }, 1000)
  }

  const changeAllowGlobal = async (allow) => {
    await requestApi.post("/team/allowGlobal", {teamId: team.id, allowGlobal: allow})
    team.allowGlobal = allow
    setTeam(cloneDeep(team))

    toast({
      title: t.isUpdated({name: ""}),
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  return <>
    <Box>
      <Form width="500px">
        <FormSection title={t.basicSetting}>
          <FormItem title={t.itemName({ name: t.team })} labelWidth="150px">
            <Input placeholder="******" value={team.name} onChange={e => { team.name = e.currentTarget.value; setTeam(cloneDeep(team)) }} />
          </FormItem>
          <FormItem title={t1.isPublic} desc={t1.isPublicTips} labelWidth="150px" alignItems="center">
            <Switch isChecked={team.isPublic} onChange={e => { team.isPublic = e.currentTarget.checked; setTeam(cloneDeep(team)) }} />
          </FormItem>
        </FormSection>
        <Button width="fit-content" size="sm" onClick={updateTeam} >{t.submit}</Button>

        {/* <FormSection title={t1.allowGlobal } desc={t1.allowGlobalTips} spacing={2}>
            <Switch isDisabled={team.id == globalTeamId} isChecked={team.allowGlobal} onChange={e => { changeAllowGlobal(e.currentTarget.checked) }} />
        </FormSection> */}

        <FormSection title={t.dangeSection}>
          <HStack>
            <Button width="fit-content" onClick={onOpen} colorScheme="red">{t.deleteItem({ name: t.team })}</Button>
            {/* <Button width="fit-content" onClick={onLeaveOpen} colorScheme="orange">Leave team</Button> */}
          </HStack>
        </FormSection>
      </Form>
    </Box>

    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        {team && <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            {t.deleteItem({ name: t.team })} - {team.name}
          </AlertDialogHeader>

          <AlertDialogBody>
            {t.deleteAlert}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              {t.cancel}
            </Button>
            <Button colorScheme='orange' onClick={deleteTeam} ml={3}>
              {t.delete}
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
            {t1.leaveTeam} - {team.name}
          </AlertDialogHeader>

          <AlertDialogBody>
            {t.deleteAlert}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onLeaveClose}>
              {t.cancel}
            </Button>
            <Button colorScheme='orange' onClick={leaveTeam} ml={3}>
              {t1.leaveTeam}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>}
      </AlertDialogOverlay>
    </AlertDialog>
  </>
}

export default TeamSettings
