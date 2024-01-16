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
  Box,
  Input,
  useToast,
  HStack,
  useColorModeValue,
  Alert,
  Text,
  Flex,
  Button,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { cloneDeep } from 'lodash'
import { useEffect, useState } from 'react'
import { MenuItem, SideMenu, Team } from 'types/teams'
import { requestApi } from 'utils/axios/request'
import SortableTree, {
  changeNodeAtPath,
} from '@nosferatu500/react-sortable-tree'
import * as Icons from 'react-icons/fa'

import '@nosferatu500/react-sortable-tree/style.css'
import { useStore } from '@nanostores/react'
import { cfgTeam, commonMsg } from 'src/i18n/locales/en'
import ReserveUrls from 'src/data/reserve-urls'
import Loading from 'src/components/loading/Loading'
import { isEmpty } from 'utils/validate'
import { locale } from 'src/i18n/i18n'

const TeamSidemenu = ({ team }: { team: Team }) => {
  const t = useStore(commonMsg)
  const t1 = useStore(cfgTeam)
  const toast = useToast()
  const [sidemenu, setSideMenu] = useState<SideMenu>(null)
  const lang = useStore(locale)
  useEffect(() => {
    loadSidemenu()
  }, [])

  const loadSidemenu = async () => {
    const res = await requestApi.get(`/team/sidemenu/${team.id}`)
    setSideMenu(res.data)
  }

  const updateSidemenu = async (sm, i) => {
    if (isEmpty(sm)) {
      sidemenu.data.splice(i, 1)
    } else {
      sidemenu.data[i] = sm
    }

    update(sidemenu)
  }

  const update = async (sidemenu) => {
    await requestApi.post(`/team/sidemenu`, sidemenu)
    toast({
      title: t1.sidemenuReload,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
  const onGoUp = (i) => {
    const newSidemenu = cloneDeep(sidemenu)
    const item = newSidemenu.data[i]
    newSidemenu.data[i] = newSidemenu.data[i - 1]
    newSidemenu.data[i - 1] = item
    setSideMenu(newSidemenu)
    update(newSidemenu)
  }

  const onGoDown = (i) => {
    const newSidemenu = cloneDeep(sidemenu)
    const item = newSidemenu.data[i]
    newSidemenu.data[i] = newSidemenu.data[i + 1]
    newSidemenu.data[i + 1] = item
    setSideMenu(newSidemenu)
    update(newSidemenu)
  }
  return (
    <>
      <Alert
        status='info'
        maxWidth='700px'
        flexDirection='column'
        alignItems='left'
      >
        <Text>{t1.sidemenuTip1}</Text>

        <Text mt='4'>
          {t1.sidemenuTip2}: &nbsp; <b>title | url | icon | dashboard id</b>{' '}
          <br />
        </Text>

        <Text mt='4'>{t1.sidemenuTip3}:</Text>
        <Text mt='2'>&nbsp;&nbsp;{t1.level} 1: /x, /y, /z</Text>
        <Text mt='2'>
          &nbsp;&nbsp;{t1.level} 2: {t1.sidemenuTip4}
        </Text>

        <Text mt='4'>
          {t1.sidemenuTip5}:
          https://react-icons.github.io/react-icons/icons?name=fa
        </Text>
      </Alert>

      <Button
        mt='2'
        onClick={() => {
          sidemenu.data.unshift([
            {
              title: 'new menu item',
              icon: 'FaQuestion',
              url: '',
              dashboardId: '',
              templateId: 0,
            },
          ])
          setSideMenu(cloneDeep(sidemenu))
        }}
        size='sm'
        variant='outline'
      >
        {lang == 'zh' ? '创建菜单' : 'Create Sidemenu'}
      </Button>

      {sidemenu ? (
        <VStack alignItems='left' mt='2'>
          {sidemenu.data.map((sm, i) => {
            if (sm.length == 0) {
              return <></>
            }

            return (
              <Box position='relative'>
                {sm[0].templateId == 0 ? (
                  <TeamRawSidemenu
                    key={i}
                    rawSidemenu={sm}
                    onChange={(sm) => updateSidemenu(sm, i)}
                  />
                ) : (
                  <TeamTemplateSidemenu key={i} sidemenu={sm} />
                )}
                <HStack position='absolute' right='2' top='7'>
                  {i != 0 && (
                    <Icons.FaArrowUp
                      cursor='pointer'
                      onClick={() => onGoUp(i)}
                    />
                  )}
                  {i < sidemenu.data.length - 1 && (
                    <Icons.FaArrowDown
                      cursor='pointer'
                      onClick={() => onGoDown(i)}
                    />
                  )}
                </HStack>
              </Box>
            )
          })}
        </VStack>
      ) : (
        <Loading style={{ marginTop: '50px' }} />
      )}
    </>
  )
}

export default TeamSidemenu

const TeamRawSidemenu = ({
  rawSidemenu,
  onChange,
}: {
  rawSidemenu: MenuItem[]
  onChange: any
}) => {
  const t = useStore(commonMsg)
  const t1 = useStore(cfgTeam)
  const toast = useToast()
  const [sidemenu, setSideMenu] = useState<MenuItem[]>(rawSidemenu)

  const getNodeKey = ({ treeIndex }) => treeIndex

  const reserveUrls = Object.values(ReserveUrls)

  const updateSidemenu = async () => {
    for (let i = 0; i < sidemenu.length; i++) {
      const item = sidemenu[i]
      if (!item.title) {
        toast({
          title: t1.sidemenuErrTitle,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      if (isEmpty(item.children) && !item.dashboardId) {
        toast({
          title: t1.sidemenuErrDashId,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      if (!item.icon) {
        toast({
          title: t1.sidemenuErrLevel1Icon,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      const icon = Icons[item.icon]
      if (!icon) {
        toast({
          title: t1.sidemenuErrIcon({ name: item.icon }),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      if (
        !item.url.startsWith('/') ||
        item.url === '/' ||
        item.url.endsWith('/')
      ) {
        toast({
          title: t1.sidemenuErrUrl({ name: item.url }),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      if (
        reserveUrls.some((url) => url.toLowerCase() === item.url.toLowerCase())
      ) {
        toast({
          title: `${item.url} is reserved, you cannot use`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      const parts = item.url.split('/').length
      if (parts != 2) {
        toast({
          title: t1.sidemenuErrLevel1Url,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      if (item.children) {
        for (let i = 0; i < item.children.length; i++) {
          const childItem = item.children[i]

          if (!childItem.url.startsWith(item.url)) {
            toast({
              title: t1.sidemenuErrLevel2Url,
              status: 'warning',
              duration: 3000,
              isClosable: true,
            })
            return
          }
          if (!childItem.title || !childItem.dashboardId) {
            toast({
              title: t1.sidemenuErrChildTitle,
              status: 'warning',
              duration: 3000,
              isClosable: true,
            })
            return
          }

          if (
            !childItem.url.startsWith('/') ||
            childItem.url === '/' ||
            childItem.url.endsWith('/')
          ) {
            toast({
              title: t1.sidemenuErrChildUrl({ name: childItem.url }),
              status: 'warning',
              duration: 3000,
              isClosable: true,
            })
            return
          }

          const parts = childItem.url.split('/').length
          if (parts != 3) {
            toast({
              title: t1.sidemenuErrLevel2Url1,
              status: 'warning',
              duration: 3000,
              isClosable: true,
            })
            return
          }
        }
      }
    }

    onChange(sidemenu)
  }

  const removeMenuItem = (item: MenuItem) => {
    for (const i in sidemenu) {
      const node = sidemenu[i]
      if (node.url == item.url && node.title == item.title) {
        sidemenu.splice(parseInt(i), 1)
        setSideMenu(cloneDeep(sidemenu))
        return
      } else {
        if (node.children) {
          for (const j in node.children) {
            const child = node.children[j]
            if (child.url == item.url && child.title == item.title) {
              node.children.splice(parseInt(j), 1)
              setSideMenu(cloneDeep(sidemenu))
              return
            }
          }
        }
      }
    }
  }

  const addMenuItem = () => {
    sidemenu.unshift({
      title: 'new menu item',
      icon: 'FaQuestion',
      url: '',
      dashboardId: '',
      templateId: 0,
    })

    setSideMenu(cloneDeep(sidemenu))
  }
  return (
    <>
      <Box className='bordered' p='2'>
        <Flex justifyContent='space-between' my='4' maxWidth='700px'>
          <Box textStyle='subTitle'>{t1.modifySidemenu}</Box>
          <HStack>
            <Button
              onClick={addMenuItem}
              variant='outline'
              leftIcon={<Icons.FaPlus />}
              size='sm'
            >
              {t1.addMenuItem}
            </Button>
            <Button onClick={updateSidemenu} size='sm'>
              {t.submit}
            </Button>
          </HStack>
        </Flex>

        <Box
          height='200px'
          sx={{
            '.rst__row': {
              alignItems: 'center',
            },
            '.rst__rowContents': {
              backgroundColor: 'var(--chakra-colors-chakra-body-bg)',
              border: 'unset',
              boxShadow: 'unset',
            },
            '.rst__moveHandle': {
              backgroundColor: useColorModeValue(
                'gray.200',
                'var(--chakra-colors-chakra-body-bg)',
              ),
              border: 'unset',
              width: '30px',
              height: '30px',
            },
            '.rst__lineHalfHorizontalRight::before, .rst__lineFullVertical::after, .rst__lineHalfVerticalTop::after, .rst__lineHalfVerticalBottom::after':
              {
                backgroundColor: useColorModeValue('brand.500', 'brand.200'),
              },
          }}
        >
          <SortableTree
            treeData={sidemenu}
            onChange={(treeData) => setSideMenu(treeData)}
            maxDepth={2}
            generateNodeProps={({ node, path }) => ({
              title: () => {
                const Icon = Icons[node.icon]
                return (
                  <HStack width='100%'>
                    <Box fontSize='1rem' opacity='0.7'>
                      {Icon && <Icon />}
                    </Box>
                    <Input
                      width='200px'
                      size='sm'
                      value={node.title}
                      onChange={(event) => {
                        const title = event.target.value
                        const newTreeData = changeNodeAtPath({
                          treeData: sidemenu,
                          path,
                          getNodeKey,
                          newNode: { ...node, title },
                        })
                        setSideMenu(newTreeData as any)
                      }}
                    />
                    <Input
                      width='150px'
                      size='sm'
                      value={node.url}
                      onChange={(event) => {
                        const newTreeData = changeNodeAtPath({
                          treeData: sidemenu,
                          path,
                          getNodeKey,
                          newNode: {
                            ...node,
                            url: event.target.value.trim(),
                          },
                        })
                        setSideMenu(newTreeData as any)
                      }}
                      placeholder='e.g /home'
                    />
                    <Input
                      width='120px'
                      size='sm'
                      value={node.icon}
                      onChange={(event) => {
                        const icon = event.target.value
                        const newTreeData = changeNodeAtPath({
                          treeData: sidemenu,
                          path,
                          getNodeKey,
                          newNode: { ...node, icon },
                        })
                        setSideMenu(newTreeData as any)
                      }}
                      placeholder='icon name'
                    />
                    {!node.children?.length && (
                      <Input
                        width='200px'
                        size='sm'
                        value={node.dashboardId}
                        onChange={(event) => {
                          const dashboardId = event.target.value
                          const newTreeData = changeNodeAtPath({
                            treeData: sidemenu,
                            path,
                            getNodeKey,
                            newNode: { ...node, dashboardId },
                          })
                          setSideMenu(newTreeData as any)
                        }}
                        placeholder='dash id, e.g d-home'
                      />
                    )}
                    <Tooltip label={t1.removeMenuItem}>
                      <Box onClick={() => removeMenuItem(node)} opacity='0.7'>
                        <Icons.FaTimes />
                      </Box>
                    </Tooltip>
                  </HStack>
                )
              },
            })}
          />
        </Box>
      </Box>
    </>
  )
}

const TeamTemplateSidemenu = ({ sidemenu }: { sidemenu: MenuItem[] }) => {
  return (
    <>
      <Box className='bordered' p='2'>
        <Box
          height='200px'
          sx={{
            '.rst__row': {
              alignItems: 'center',
            },
            '.rst__rowContents': {
              backgroundColor: 'var(--chakra-colors-chakra-body-bg)',
              border: 'unset',
              boxShadow: 'unset',
            },
            '.rst__moveHandle': {
              backgroundColor: useColorModeValue(
                'gray.200',
                'var(--chakra-colors-chakra-body-bg)',
              ),
              border: 'unset',
              width: '30px',
              height: '30px',
            },
            '.rst__lineHalfHorizontalRight::before, .rst__lineFullVertical::after, .rst__lineHalfVerticalTop::after, .rst__lineHalfVerticalBottom::after':
              {
                backgroundColor: useColorModeValue('brand.500', 'brand.200'),
              },
          }}
        >
          <SortableTree
            treeData={sidemenu}
            onChange={null}
            maxDepth={2}
            canDrag={() => false}
            generateNodeProps={({ node, path }) => ({
              title: () => {
                const Icon = Icons[node.icon]
                return (
                  <HStack width='100%'>
                    <Box fontSize='1rem' opacity='0.7'>
                      {Icon && <Icon />}
                    </Box>
                    <Input
                      width='200px'
                      size='sm'
                      value={node.title}
                      isDisabled
                    />
                    <Input
                      width='150px'
                      size='sm'
                      value={node.url}
                      isDisabled
                      placeholder='e.g /home'
                    />
                    <Input
                      width='120px'
                      size='sm'
                      value={node.icon}
                      isDisabled
                      placeholder='icon name'
                    />
                    {!node.children?.length && (
                      <Input
                        width='200px'
                        size='sm'
                        value={node.dashboardId}
                        isDisabled
                        placeholder='dash id, e.g d-home'
                      />
                    )}
                  </HStack>
                )
              },
            })}
          />
        </Box>
      </Box>
    </>
  )
}
