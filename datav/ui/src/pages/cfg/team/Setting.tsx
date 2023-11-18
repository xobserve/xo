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
import { Box, Button, Input, useDisclosure, useToast, VStack, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, HStack, FormLabel, Switch, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, ModalHeader, Text } from "@chakra-ui/react"
import { Form, FormSection } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep } from "lodash"
import { useRef, useState } from "react"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { useNavigate, useParams } from "react-router-dom"
import { useStore } from "@nanostores/react"
import { cfgTeam, commonMsg } from "src/i18n/locales/en"
import { $teams } from "src/views/team/store"
import { Role, isSuperAdmin } from "types/role"
import { $config } from "src/data/configs/config"
import { isEmpty } from "utils/validate"

const TeamSettings = (props: { team: Team }) => {
  const t = useStore(commonMsg)
  const t1 = useStore(cfgTeam)
  const [team, setTeam] = useState<Team>(props.team)
  const navigate = useNavigate()
  const toast = useToast()
  const config = useStore($config)

  const [transferTo, setTransferTo] = useState<string>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure()
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure()
  const { isOpen: isTransferAlertOpen, onOpen: onTransferAlertOpen, onClose: onTransferAlertClose } = useDisclosure()

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
      navigate(`/`)
    }, 1000)
  }

  const leaveTeam = async () => {
    await requestApi.post(`/team/leave/${team.id}`)
    toast({
      title: t1.leaveTeam,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      navigate(`/`)
    }, 1000)
  }

  const transferTeam = async () => {
    if (isEmpty(transferTo)) {
      toast({
        title: t.isReqiiured({ name: t.userName }),
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    await requestApi.post(`/team/transfer/${config.currentTeam}/${transferTo}`)
    toast({
      title: t.success,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      window.location.reload()
    }, 1000)
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


        <FormSection title={t.dangeSection}>
          {isSuperAdmin(config.teamRole) ?
            <HStack>
              <Button width="fit-content" variant="outline" onClick={onTransferOpen} colorScheme="orange">{t1.transferTenant}</Button>
              <Button width="fit-content" onClick={onOpen} colorScheme="red">{t.deleteItem({ name: t.team })}</Button>
              {/* <Button width="fit-content" onClick={onLeaveOpen} colorScheme="orange">Leave team</Button> */}
            </HStack>
          : <Button width="fit-content" onClick={onLeaveOpen} colorScheme="red">{t1.leaveTeam}</Button>}
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
    <Modal isOpen={isTransferOpen} onClose={() => { setTransferTo(null); onTransferClose() }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t1.transferTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody py="4">
          <FormSection title={t.userName}>
            <Input value={transferTo} onChange={e => setTransferTo(e.currentTarget.value)} />
          </FormSection>
          <Button mt="2" colorScheme="orange" onClick={onTransferAlertOpen}>{t.submit}</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
    <AlertDialog
      isOpen={isTransferAlertOpen}
      onClose={onTransferAlertClose}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        {team && <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            {t1.transferTeam} `{team.name}` to user `{transferTo}`
          </AlertDialogHeader>

          <AlertDialogBody>
            {t1.transferAlert}
            <Text mt="2" fontWeight={550}>{t1.transferAlertTips}</Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} variant="unstyled" onClick={onTransferAlertClose}>
              {t.cancel}
            </Button>
            <Button colorScheme='orange' onDoubleClick={transferTeam} ml={3}>
              {t.submit}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>}
      </AlertDialogOverlay>
    </AlertDialog>

  </>
}

export default TeamSettings
