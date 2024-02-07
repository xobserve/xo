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
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Input,
  StackDivider,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import Empty from 'components/Empty'
import { EditorNumberItem } from 'components/editor/EditorItem'
import { Form, FormSection } from 'components/form/Form'
import FormItem from 'components/form/Item'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { locale } from 'src/i18n/i18n'
import { commonMsg } from 'src/i18n/locales/en'
import { AccessToken } from 'types/accesstoken'
import { Scope } from 'types/scope'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'

interface Props {
  scope: Scope
  scopeId: string
  hidenTitle?: boolean
}

const AccessTokenManage = ({ scope, scopeId, hidenTitle = false }: Props) => {
  const toast = useToast()
  const t = commonMsg.get()
  const lang = locale.get()
  const [tokens, setTokens] = useState<AccessToken[]>([])
  const [tempToken, setTempToken] = useState<Partial<AccessToken>>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const [deleteToken, setDeleteToken] = useState<AccessToken>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await requestApi.get(`/accessToken/list/${scope}/${scopeId}`)
    setTokens(res.data)
  }
  const onCreateToken = async () => {
    if (isEmpty(tempToken.name) || isEmpty(tempToken.expired)) {
      toast({
        title: 'Token name or expired is required',
        status: 'error',
      })
      return
    }

    await requestApi.post(`/accessToken/create`, tempToken)
    await load()
    setTempToken(null)
  }

  const onDeleteToken = async () => {
    await requestApi.delete(`/accessToken/${deleteToken.id}`)
    await load()
    setDeleteToken(null)
    onClose()
  }
  return (
    <>
      <Box>
        <Flex alignItems='center' gap='4' mb='6'>
          {!hidenTitle && (
            <Heading size='md'> {'Manage access tokens'}</Heading>
          )}
          <Button
            size='sm'
            onClick={() =>
              setTempToken({
                scope,
                scopeId,
                name: '',
                description: '',
                expired: 7,
              })
            }
            variant='outline'
          >
            Generate new token
          </Button>
        </Flex>
        {tempToken ? (
          <Form
            sx={{
              '.form-item-label': {
                width: '150px',
              },
            }}
            maxW={600}
          >
            <FormSection>
              <FormItem
                title='Token name'
                desc={'give a short name to this token'}
              >
                <Input
                  placeholder={t.inputTips({ name: t.name })}
                  value={tempToken.name}
                  onChange={(e) => {
                    setTempToken({
                      ...tempToken,
                      name: e.currentTarget.value.trim(),
                    })
                  }}
                />
              </FormItem>
              <FormItem
                title='Expired in'
                alignItems='center'
                desc='When will this token be expired,set to 0 means no expiration'
              >
                <EditorNumberItem
                  value={tempToken.expired}
                  onChange={(v) => {
                    setTempToken({ ...tempToken, expired: v })
                  }}
                  step={5}
                />
                Days
              </FormItem>
              <FormItem title={t.description} desc={'what is this token for'}>
                <Textarea
                  value={tempToken.description}
                  onChange={(e) => {
                    setTempToken({
                      ...tempToken,
                      description: e.currentTarget.value,
                    })
                  }}
                />
              </FormItem>
            </FormSection>
            <HStack>
              <Button variant='ghost' onClick={() => setTempToken(null)}>
                Cancel
              </Button>
              <Button onClick={onCreateToken}>Submit</Button>
            </HStack>
          </Form>
        ) : isEmpty(tokens) ? (
          <Empty />
        ) : (
          <VStack
            divider={<StackDivider />}
            alignItems='left'
            maxW={800}
            spacing={0}
          >
            {tokens.map((token) => (
              <AccessTokenItem
                key={token.id}
                token={token}
                onDeleteToken={() => {
                  setDeleteToken(token)
                  onOpen()
                }}
                selected={deleteToken?.id == token.id}
              />
            ))}
          </VStack>
        )}
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setDeleteToken(null)
          onClose()
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {t.deleteItem({ name: t.accessToken })} : {deleteToken?.name}
            </AlertDialogHeader>

            <AlertDialogBody>{t.deleteAlert}</AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setDeleteToken(null)
                  onClose()
                }}
              >
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={onDeleteToken} ml={3}>
                {t.delete}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default AccessTokenManage

interface AccessTokenItemProps {
  token: AccessToken
  onDeleteToken: any
  selected: boolean
}

const AccessTokenItem = ({
  token,
  onDeleteToken,
  selected,
}: AccessTokenItemProps) => {
  const [tokenStr, setTokenStr] = useState(null)
  let expired = 'Never expires'
  if (token.expired) {
    expired = `Expires on ${moment(token.created)
      .add(token.expired, 'days')
      .format('yy-MM-DD HH:mm')}`
  }

  const onViewToken = async (token: AccessToken) => {
    const res = await requestApi.get(`/accessToken/view/${token.id}`)
    setTokenStr(res.data)
  }

  return (
    <>
      <Flex
        justifyContent='space-between'
        alignItems='center'
        className={'highlight-bordered'}
        borderColor={selected ? null : 'transparent !important'}
        p='4'
      >
        <Box>
          <HStack>
            <Text>{token.name}</Text>
          </HStack>
          <Text textStyle='annotation' mt='1'>
            {token.description}
          </Text>
        </Box>

        <HStack>
          <Text textStyle='annotation' fontWeight={500}>
            {expired}
          </Text>
          <Button
            size='sm'
            variant='ghost'
            colorScheme='orange'
            onClick={() => onViewToken(token)}
          >
            View token
          </Button>
          <Button
            size='sm'
            variant='outline'
            colorScheme='red'
            onClick={() => onDeleteToken(token)}
          >
            Delete
          </Button>
        </HStack>
      </Flex>
      {tokenStr && (
        <Alert status='warning'>
          <AlertIcon />
          {tokenStr}
        </Alert>
      )}
    </>
  )
}
