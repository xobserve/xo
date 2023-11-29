// Copyright 2023 xObserve.io Team

import React from 'react'
import {
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  HStack,
  ModalHeader,
  ModalOverlay,
  Text,
  RadioGroup,
  Stack,
  Radio,
  useToast,
  VStack,
  Box,
  Input,
  Flex,
  Tag,
} from '@chakra-ui/react'
import { Form, FormSection } from 'src/components/form/Form'
import useSession from 'hooks/use-session'
import Page from 'layouts/page/Page'
import { cloneDeep } from 'lodash'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { FaCog } from 'react-icons/fa'
import { Role } from 'types/role'
import { User } from 'types/user'
import { requestApi } from 'utils/axios/request'
import { useStore } from '@nanostores/react'
import { websiteAdmin, commonMsg } from 'src/i18n/locales/en'
import { locale } from 'src/i18n/i18n'
import { EditorInputItem } from 'components/editor/EditorItem'
import { useNavigate } from 'react-router-dom'
import { $config } from 'src/data/configs/config'
import { Team } from 'types/teams'
import ColorTag from 'components/ColorTag'
import { getTenantLinks } from './links'

const AdminTenantUsers = () => {
  const navigate = useNavigate()
  const t = useStore(commonMsg)
  const t1 = useStore(websiteAdmin)
  const lang = useStore(locale)
  const { session } = useSession()
  const toast = useToast()
  const [users, setUsers] = useState<User[]>(null)
  const config = useStore($config)
  const tenantLinks = getTenantLinks(config.currentTeam)

  useEffect(() => {
    if (config) {
      load()
    }
  }, [config])

  const [userInEdit, setUserInEdit] = useState<User>()
  const [userInDelete, setUserInDelete] = useState<User>(null)
  const [userDetail, setUserDetail] = useState<{ user: User; teams: Team[] }>(
    null,
  )

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure()

  const cancelRef = useRef()

  const load = async () => {
    const res = await requestApi.get(`/tenant/users/${config.currentTenant}`)
    setUsers(res.data)
  }

  const editUser = (m: User) => {
    setUserInEdit(cloneDeep(m))
    onOpen()
  }

  const onDeleteUser = async () => {
    await requestApi.delete(
      `/tenant/user/${userInDelete.id}/${config.currentTenant}`,
    )
    toast({
      title: t.isDeleted({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setUserInDelete(null)
    onAlertClose()

    load()
  }

  const onAddUser = () => {
    setUserInEdit({ role: Role.Viewer } as any)
    onOpen()
  }

  const onSubmitUser = async () => {
    await requestApi.post(`/tenant/user`, {
      ...userInEdit,
      currentTenant: config.currentTenant,
    })
    toast({
      title: t.isUpdated({ name: t1.userRole }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    load()
    onClose()
  }

  const viewDetail = async (user: User) => {
    const res = await requestApi.get(
      `/user/detail?id=${user.id}&tenantId=${config.currentTenant}`,
    )
    setUserDetail({
      user: user,
      teams: res.data[0]?.teams ?? [],
    })
    onDetailOpen()
  }

  return (
    <>
      <Page
        title={
          lang == 'en'
            ? `Tenant Admin - ${config?.tenantName}`
            : `租户管理 - ${config?.tenantName}`
        }
        subTitle={t.manageItem({ name: t.members })}
        icon={<FaCog />}
        tabs={tenantLinks}
        isLoading={users === null}
      >
        <Flex justifyContent='space-between'>
          <Box></Box>
          <Button size='sm' onClick={onAddUser}>
            {t.addItem({ name: t.members })}
          </Button>
        </Flex>

        <TableContainer mt='2'>
          <Table variant='simple' size='sm' className='color-border-table'>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>{t.userName}</Th>
                <Th>{t.role}</Th>
                <Th>{t.joined}</Th>
                <Th>{t.action}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map((user) => {
                return (
                  <Tr key={user.id}>
                    <Td>{user.id}</Td>
                    <Td>
                      <HStack>
                        <span>{user.username}</span>{' '}
                        {session?.user?.id == user.id && (
                          <Tag size={'sm'}>You</Tag>
                        )}
                      </HStack>
                    </Td>
                    <Td>{t[user.role]}</Td>
                    <Td>{moment(user.created).fromNow()}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          onClick={() => editUser(user)}
                        >
                          {t.edit}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          ml='1'
                          onClick={() => viewDetail(user)}
                        >
                          {t.detail}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          onClick={() => {
                            setUserInDelete(user)
                            onAlertOpen()
                          }}
                          colorScheme='red'
                          ml='2'
                        >
                          {t.delete}
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Page>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setUserInEdit(null)
          onClose()
        }}
      >
        <ModalOverlay />
        {userInEdit && (
          <ModalContent>
            <ModalHeader>
              {userInEdit.id
                ? t.editItem({ name: t.members })
                : t.addItem({ name: t.members })}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Form pb='5'>
                <FormSection title={t.userName}>
                  <EditorInputItem
                    value={userInEdit.username}
                    onChange={(v) => {
                      userInEdit.username = v
                      setUserInEdit(cloneDeep(userInEdit))
                    }}
                    disabled={userInEdit.id !== undefined}
                  />
                </FormSection>

                <FormSection title={t1.globalRole}>
                  <RadioGroup
                    mt='1'
                    onChange={(v) => {
                      userInEdit.role = v as Role
                      setUserInEdit(cloneDeep(userInEdit))
                    }}
                    value={userInEdit.role}
                    isDisabled={userInEdit.role == Role.SUPER_ADMIN}
                  >
                    <Stack direction='row'>
                      <Radio value={Role.Viewer}>{t[Role.Viewer]}</Radio>
                      <Radio value={Role.ADMIN}>{t[Role.ADMIN]}</Radio>
                      {userInEdit.role == Role.SUPER_ADMIN && (
                        <Radio value={Role.SUPER_ADMIN}>
                          {t[Role.SUPER_ADMIN]}
                        </Radio>
                      )}
                    </Stack>
                  </RadioGroup>
                </FormSection>

                <Button onClick={onSubmitUser}>Submit</Button>
              </Form>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {t.deleteItem({ name: t.members })} - {userInDelete?.username}
            </AlertDialogHeader>

            <AlertDialogBody>{t.deleteAlert}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={onDeleteUser} ml={3}>
                {t.delete}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setUserDetail(null)
          onDetailClose()
        }}
      >
        <ModalOverlay />
        {userDetail && (
          <ModalContent>
            <ModalCloseButton />
            <ModalBody py='4'>
              <Text fontWeight={550}>
                User `{userDetail.user.username}` is in teams:{' '}
              </Text>
              <HStack my='3'>
                {userDetail.teams.map((team) => (
                  <Box
                    cursor='pointer'
                    onClick={() =>
                      navigate(`/${config.currentTeam}/cfg/team/members`)
                    }
                  >
                    <ColorTag name={team.name} />
                  </Box>
                ))}
              </HStack>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
    </>
  )
}

export default AdminTenantUsers
