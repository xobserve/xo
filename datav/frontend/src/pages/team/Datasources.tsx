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

import React from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
  Flex,
  Box,
  useToast,
  HStack,
  Image,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tag,
} from '@chakra-ui/react'
import { Form } from 'src/components/form/Form'
import { isEmpty } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import ReserveUrls from 'src/data/reserve-urls'
import DatasourceEditor from 'src/views/datasource/Editor'
import { Datasource } from 'types/datasource'
import { requestApi } from 'utils/axios/request'
import { useParams } from 'react-router-dom'
import { useStore } from '@nanostores/react'
import { cfgDatasourceMsg, commonMsg } from 'src/i18n/locales/en'
import { Team } from 'types/teams'
import { externalDatasourcePlugins } from 'src/views/dashboard/plugins/external/plugins'
import Loading from 'components/loading/Loading'
import { builtinDatasourcePlugins } from 'src/views/dashboard/plugins/built-in/plugins'
import { navigateTo } from 'utils/url'
import TemplateBadge from 'src/views/template/TemplateBadge'
import { $datasources } from 'src/views/datasource/store'

const TeamDatasources = ({ team, load }: { team: Team; load: any }) => {
  const t = useStore(commonMsg)
  const t1 = useStore(cfgDatasourceMsg)
  const toast = useToast()
  const datasources = useStore($datasources)
  const [datasource, setDatasource] = useState<Datasource>(null)
  const teamId = useParams().teamId
  const teamPath = isEmpty(teamId) ? '' : `/${teamId}`

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()
  const cancelRef = useRef()

  const onChange = () => {
    onEditClose()
    load()
  }

  const onEditClose = () => {
    setDatasource(null)
    onClose()
  }

  const closeAlert = () => {
    setDatasource(null)
    onAlertClose()
  }

  const deleteDatasource = async () => {
    await requestApi.delete(`/datasource/${datasource.teamId}/${datasource.id}`)
    toast({
      description: t1.deleteToast({ name: datasource.name }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    const dss = datasources.filter((ds) => ds.id != datasource.id)
    $datasources.set(dss)
    closeAlert()
  }

  const builtInDatasources = []
  const externalDatasources = []
  datasources?.forEach((ds) => {
    const p = externalDatasourcePlugins[ds.type]
    if (p) {
      externalDatasources.push(ds)
    } else {
      builtInDatasources.push(ds)
    }
  })

  const getPlugin = (ds: Datasource) => {
    const p =
      builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
    return p
  }

  return (
    <>
      <Box>
        <Flex justifyContent='space-between' alignItems='end'>
          <Text>{t.builtIn}</Text>
          <Button
            size='sm'
            onClick={() =>
              navigateTo(
                teamPath + ReserveUrls.New + `/datasource?teamId=${team.id}`,
              )
            }
          >
            {t.newItem({ name: t.datasource })}
          </Button>
        </Flex>

        {datasources ? (
          <VStack alignItems='left' spacing={2} mt='3'>
            {builtInDatasources?.map((ds) => {
              return (
                <DatasourceCard
                  ds={ds}
                  selectedDs={datasource}
                  plugin={getPlugin(ds)}
                  t={t}
                  onEdit={() => {
                    setDatasource(ds)
                    onOpen()
                  }}
                  onDelete={() => {
                    onAlertOpen()
                    setDatasource(ds)
                  }}
                />
              )
            })}
            <Text>{t.external}</Text>
            {externalDatasources?.map((ds) => {
              return (
                <DatasourceCard
                  ds={ds}
                  selectedDs={datasource}
                  plugin={getPlugin(ds)}
                  t={t}
                  onEdit={() => {
                    setDatasource(ds)
                    onOpen()
                  }}
                  onDelete={() => {
                    onAlertOpen()
                    setDatasource(ds)
                  }}
                />
              )
            })}
          </VStack>
        ) : (
          <Loading style={{ marginTop: '50px' }} />
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t.editItem({ name: t.datasource })}- {datasource?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form
              spacing={2}
              sx={{
                '.form-item-label': {
                  width: '50px',
                },
              }}
            >
              {datasource && (
                <DatasourceEditor
                  ds={datasource}
                  onChange={onChange}
                  teamEditable={false}
                />
              )}
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {t.deleteItem({ name: t.datasource })} {datasource?.name}
            </AlertDialogHeader>

            <AlertDialogBody>{t.deleteAlert}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeAlert}>
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={deleteDatasource} ml={3}>
                {t.delete}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default TeamDatasources

interface DatasourceCardProps {
  ds: Datasource
  selectedDs: Datasource
  plugin: any
  onEdit: () => void
  onDelete: () => void
  t: any
}
const DatasourceCard = ({
  ds,
  selectedDs,
  plugin,
  onEdit,
  onDelete,
  t,
}: DatasourceCardProps) => {
  return (
    <Flex
      key={ds.id}
      className={`${selectedDs?.id == ds.id ? 'tag-bg' : ''} label-bg`}
      p='4'
      alignItems='center'
      justifyContent='space-between'
    >
      <HStack>
        <Image width='50px' height='50px' src={plugin?.settings.icon} />
        <Box>
          <HStack>
            <Text fontWeight='550'>{ds.name}</Text>
            {ds.templateId != 0 && (
              <TemplateBadge templateId={ds.templateId} unlinkTemplate={null} />
            )}
            {!plugin && (
              <Tag colorScheme='red' size='sm'>
                {ds.type} plugin not installed
              </Tag>
            )}
          </HStack>
          <Text textStyle='annotation' mt='1'>
            {ds.type} {!isEmpty(ds.url) && ` · ` + ds.url}
          </Text>
        </Box>
      </HStack>

      <HStack spacing={1}>
        <Button size='sm' variant='ghost' onClick={onEdit}>
          {t.edit}
        </Button>
        <Button
          size='sm'
          variant='ghost'
          colorScheme='orange'
          onClick={onDelete}
        >
          {t.delete}
        </Button>
      </HStack>
    </Flex>
  )
}
