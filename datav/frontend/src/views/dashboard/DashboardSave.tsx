// Copyright 2023 xobserve.io Team
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

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  StackDivider,
  Tag,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useLeavePageConfirm } from 'hooks/useLeavePage'
import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { FaRegSave } from 'react-icons/fa'
import { Dashboard } from 'types/dashboard'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'
import { requestApi } from 'utils/axios/request'
import useBus, { dispatch } from 'use-bus'
import {
  DashboardSavedEvent,
  OnDashboardSaveEvent,
  SaveDashboardEvent,
  SetDashboardEvent,
} from 'src/data/bus-events'
import ReactDiffViewer from 'react-diff-viewer'
import { useSearchParam } from 'react-use'
import { cloneDeep, isEqual } from 'lodash'
import FormItem from 'src/components/form/Item'
import { useStore } from '@nanostores/react'
import { commonMsg, dashboardSaveMsg } from 'src/i18n/locales/en'
import { dateTimeFormat } from 'utils/datetime/formatter'
import useEmbed from 'hooks/useEmbed'

interface Props {
  dashboard: Dashboard
}
const DashboardSave = ({ dashboard }: Props) => {
  const t = useStore(commonMsg)
  const t1 = useStore(dashboardSaveMsg)

  const edit = useSearchParam('edit')
  const { colorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isSaveOpen,
    onOpen: onSaveOpen,
    onClose: onSaveClose,
  } = useDisclosure()
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure()
  const [saved, setSaved] = useState(null)
  const [pageChanged, setPageChanged] = useState(false)
  const [inPreview, setInPreview] = useState(false)
  const [updateChanges, setUpdateChanges] = useState('')
  const [pressed] = useKeyboardJs('ctrl+s')
  const embed = useEmbed()
  useLeavePageConfirm(
    embed ? false : dashboard.data.enableUnsavePrompt ? pageChanged : false,
  )

  useBus(
    SaveDashboardEvent,
    () => {
      onSave(false)
    },
    [dashboard],
  )

  useEffect(() => {
    if (!embed && pressed && !isOpen) {
      onSaveOpen()
    }
  }, [pressed])

  useEffect(() => {
    if (!saved && dashboard) {
      setSaved(cloneDeep(dashboard))
      return
    }

    const changed = !isEqual(dashboard, saved)
    setPageChanged(changed)
    if (changed) {
      setPageChanged(true)
    } else {
      setPageChanged(false)
    }
  }, [dashboard])

  const autoSaveH = useRef(null)
  useEffect(() => {
    if (dashboard.data.enableAutoSave) {
      if (edit) {
        toast({
          title: t1.autoSaveNotAvail,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      autoSaveH.current = setInterval(() => {
        onSave(true)
      }, dashboard.data.autoSaveInterval * 1000)
    }

    return () => {
      clearInterval(autoSaveH.current)
      autoSaveH.current = null
    }
  }, [dashboard, inPreview, edit])

  const toast = useToast()
  const onSave = async (autoSave) => {
    const changeMsg = autoSave ? 'Auto save' : updateChanges
    if (inPreview && autoSave) {
      toast({
        title: t1.autoSaveNotAvail1,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (inPreview && changeMsg.trim() == '') {
      toast({
        title: t1.saveMsgRequired,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const dash = cloneDeep(dashboard)
    // remove template contents

    await requestApi.post('/dashboard/save', { dashboard, changes: changeMsg })
    toast({
      title: t1.savedMsg({ name: autoSave ? t.auto : '' }),
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    setSaved(cloneDeep(dashboard))
    setPageChanged(false)
    if (inPreview) {
      location.reload()
    }
    onSaveClose()

    dispatch(DashboardSavedEvent)
  }

  const onViewHistory = () => {
    if (!inPreview && pageChanged) {
      toast({
        title: t1.saveDueToChanges,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    onOpen()
  }
  const onPreview = (isPreview) => {
    setInPreview(isPreview)
    const msg = isPreview ? t1.onPreviewMsg1 : t1.onPreviewMsg2
    const id = isPreview ? 'inPreview' : 'notInPreview'
    const duration = isPreview ? 10000 : 2000
    if (!toast.isActive(id)) {
      toast({
        id: id,
        title: msg,
        description: isPreview && t1.onPreviewMsg3,
        status: isPreview ? 'info' : 'success',
        duration: duration,
        isClosable: true,
      })
    }
  }
  return (
    <>
      <Box>
        <Menu placement='bottom'>
          <Tooltip label={t1.saveDash}>
            <MenuButton
              as={IconButton}
              variant='ghost'
              sx={{
                span: {
                  display: 'flex',
                  justifyContent: 'center',
                },
              }}
            >
              <FaRegSave />
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem onClick={onSaveOpen}>{t.save}</MenuItem>
            <MenuItem onClick={onViewHistory}>{t1.viewHistory}</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Drawer
        key={dashboard.id}
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>{t1.saveHistoryHeader}</DrawerHeader>

          <DrawerBody>
            <DashboardHistory dashboard={dashboard} onPreview={onPreview} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isSaveOpen} onClose={onSaveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t1.saveDash}: {dashboard.title}
          </ModalHeader>
          <ModalBody>
            {inPreview && (
              <Alert status='error' flexDirection='column'>
                <AlertIcon />
                <AlertTitle>{t1.dangerous}</AlertTitle>
                <AlertDescription fontWeight='bold' mt='1'>
                  {t1.saveOverrideTips}
                </AlertDescription>
              </Alert>
            )}
            <FormItem title={t1.describeSaveChanges}>
              <Input
                value={updateChanges}
                onChange={(e) => setUpdateChanges(e.currentTarget.value)}
                placeholder={t1.saveMsgTips}
              />
            </FormItem>
            {/* <ReactDiffViewer oldValue={JSON.stringify(saved,null,4)} newValue={JSON.stringify(dashboard,null,4)} splitView={true} useDarkTheme={colorMode!="light" } /> */}
          </ModalBody>

          <ModalFooter width='100%' justifyContent='space-between'>
            {!edit && (
              <Button variant='outline' onClick={onViewOpen}>
                {t1.viewChanges}
              </Button>
            )}
            <HStack spacing='0'>
              <Button mr={3} onClick={onSaveClose}>
                {t.cancel}
              </Button>
              <Button
                variant='ghost'
                onClick={() => {
                  if (edit) {
                    dispatch(OnDashboardSaveEvent)
                  } else {
                    onSave(false)
                  }
                }}
              >
                {t.submit}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isViewOpen} onClose={onViewClose} size='full'>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody fontSize='0.8rem'>
            <Center mb='2'>
              <Text textStyle='subTitle' fontWeight='bold'>
                {t1.showDiffLine}
              </Text>
            </Center>
            <ReactDiffViewer
              oldValue={JSON.stringify(saved, null, 2)}
              newValue={JSON.stringify(dashboard, null, 2)}
              splitView={true}
              useDarkTheme={colorMode != 'light'}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DashboardSave

interface HistoryProps {
  dashboard: Dashboard
  onPreview: any
}

const DashboardHistory = ({ dashboard, onPreview }: HistoryProps) => {
  const t1 = useStore(dashboardSaveMsg)

  const [history, setHistory] = useState([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await requestApi.get(
      `/dashboard/history/${dashboard.ownedBy}/${dashboard.id}`,
    )
    setHistory(res.data)
  }

  return (
    <VStack alignItems='left' divider={<StackDivider />}>
      {history.map((h, i) => {
        const dash = h.dashboard
        return (
          <Box>
            <Flex alignItems='center' justifyContent='space-between'>
              <HStack>
                <Text fontSize='0.9rem'>{dateTimeFormat(dash.updated)}</Text>
              </HStack>
              <HStack>
                {i == 0 && (
                  <Tooltip label={t1.useCurrentDash}>
                    <Tag
                      cursor='pointer'
                      onClick={() => {
                        // sent two events to ensure the raw dashhboard has no changes, it's weird, but hard to fix
                        dispatch({ type: SetDashboardEvent, data: dash })
                        setTimeout(() => {
                          dispatch({ type: SetDashboardEvent, data: dash })
                        }, 5000)

                        onPreview(false)
                      }}
                    >
                      {t1.current}
                    </Tag>
                  </Tooltip>
                )}
                {i != 0 && (
                  <Button
                    size='xs'
                    variant={
                      dashboard.updated == dash.updated ? 'solid' : 'outline'
                    }
                    onClick={() => {
                      dispatch({ type: SetDashboardEvent, data: dash })
                      onPreview(true)
                    }}
                  >
                    {t1.preview}
                  </Button>
                )}
              </HStack>
            </Flex>
            <Text layerStyle='textFourth' fontSize='0.9rem'>
              {h.changes}
            </Text>
          </Box>
        )
      })}
    </VStack>
  )
}
