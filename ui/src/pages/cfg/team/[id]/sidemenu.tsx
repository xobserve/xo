import React from "react"
import { Box, Input, useToast,  HStack, useColorModeValue, Alert, Text, Flex, Button, Tooltip } from "@chakra-ui/react"
import { cloneDeep, isEmpty } from "lodash"
import { useEffect, useState } from "react"
import { MenuItem, SideMenu, Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import SortableTree, { changeNodeAtPath } from '@nosferatu500/react-sortable-tree';
import * as Icons from 'react-icons/fa'
import TeamLayout from "./components/Layout"

import '@nosferatu500/react-sortable-tree/style.css';
import { useStore } from "@nanostores/react"
import { cfgTeam, commonMsg } from "src/i18n/locales/en"

const TeamSidemenuPage = () => {
    return <>
      <TeamLayout>
        {/* @ts-ignore */}
        <TeamSidemenu />
      </TeamLayout>
  
    </>
  }

  
const TeamSidemenu = ({team}:{team:Team}) => {
    const t = useStore(commonMsg)
    const t1 = useStore(cfgTeam)
    const toast = useToast()
    const [sidemenu, setSideMenu] = useState<SideMenu>()


    const getNodeKey = ({ treeIndex }) => treeIndex

    useEffect(() => {
            loadSidemenu()
    }, [])



    const loadSidemenu = async () => {
        const res = await requestApi.get(`/team/sidemenu/${team.id}`)
        setSideMenu(res.data)
    }

    const updateSidemenu = async () => {
        for (let i = 0; i < sidemenu.data.length; i++) {
            const item = sidemenu.data[i]
            if (!item.title) {
                toast({
                    title: t1.sidemenuErrTitle,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return
            }

            if (isEmpty(item.children)  && !item.dashboardId) {
                toast({
                    title: t1.sidemenuErrDashId,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return
            }

            if (!item.icon) {
                toast({
                    title: t1.sidemenuErrLevel1Icon,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            }

            const icon = Icons[item.icon]
            if (!icon) {
                toast({
                    title:t1.sidemenuErrIcon({name: item.icon}),
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            }

            if (!item.url.startsWith('/') || item.url === '/' || item.url.endsWith('/')) {
                toast({
                    title: t1.sidemenuErrUrl({name: item.url}),
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            }

            const parts = item.url.split('/').length
            if (parts != 2) {
                toast({
                    title: t1.sidemenuErrLevel1Url,
                    status: "warning",
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
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                        })
                        return
                    }
                    if (!childItem.title || !childItem.dashboardId) {
                        toast({
                            title: t1.sidemenuErrChildTitle,
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                        })
                        return
                    }

                    if (!childItem.url.startsWith('/') || childItem.url === '/' || childItem.url.endsWith('/')) {
                        toast({
                            title: t1.sidemenuErrChildUrl({name: childItem.url}),
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                        })
                        return 
                    }
        
                    const parts = childItem.url.split('/').length
                    if (parts != 3) {
                        toast({
                            title: t1.sidemenuErrLevel2Url1,
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                        })
                        return 
                    } 
                }
            }
        }

        await requestApi.post(`/team/sidemenu`, { ...sidemenu })
        toast({
            title:  t1.sidemenuReload,
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }

    const removeMenuItem = (item: MenuItem) => {
        for (const i in sidemenu.data) {
            const node = sidemenu.data[i]
            if (node.url == item.url && node.title == item.title) {
                sidemenu.data.splice(parseInt(i), 1)
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
        sidemenu.data.unshift({
            title: 'new menu item',
            icon: 'FaQuestion',
            url: '',
            dashboardId: ''
        })

        setSideMenu(cloneDeep(sidemenu))
    }
    return <>
        {sidemenu && <Box>
            <Alert status='info' maxWidth="700px" flexDirection="column" alignItems="left">
                <Text>{t1.sidemenuTip1}</Text>

                <Text mt="4">{t1.sidemenuTip2}: &nbsp; <b>title | url | icon | dashboard id</b> <br /></Text>

                <Text mt="4">{t1.sidemenuTip3}:</Text>
                <Text mt="2">&nbsp;&nbsp;{t1.level} 1: /x, /y, /z</Text>
                <Text mt="2">&nbsp;&nbsp;{t1.level} 2: {t1.sidemenuTip4}</Text>

                <Text mt="4">{t1.sidemenuTip5}: https://react-icons.github.io/react-icons/icons?name=fa</Text>
            </Alert>
            <Flex justifyContent="space-between" my="4" maxWidth="700px">
                <Box textStyle="subTitle">{t1.modifySidemenu}</Box>
                <HStack>
                    <Button onClick={addMenuItem} variant="outline" leftIcon={<Icons.FaPlus />}>{t1.addMenuItem}</Button>
                    <Button onClick={updateSidemenu}>{t.submit}</Button>
                </HStack>
                
            </Flex>

            <Box height="600px" sx={{
                '.rst__rowContents': {
                    backgroundColor: 'var(--chakra-colors-chakra-body-bg)',
                    border: 'unset',
                    boxShadow: 'unset',
                },
                '.rst__moveHandle': {
                    backgroundColor: useColorModeValue('gray.200', 'var(--chakra-colors-chakra-body-bg)'),
                    border: 'unset'
                },
                ".rst__lineHalfHorizontalRight::before, .rst__lineFullVertical::after, .rst__lineHalfVerticalTop::after, .rst__lineHalfVerticalBottom::after": {
                    backgroundColor: useColorModeValue("brand.500", "brand.200")
                }
            }}>
                <SortableTree
                    treeData={sidemenu.data}
                    onChange={treeData => setSideMenu({ ...sidemenu, data: treeData })}
                    maxDepth={2}
                    generateNodeProps={({ node, path }) => ({
                        title: () => {
                            const Icon = Icons[node.icon]
                            return (
                                <HStack width="100%">
                                    <Box width="30px" fontSize="25px">{Icon && <Icon />}</Box>
                                    <Input
                                        width="200px"
                                        value={node.title}
                                        onChange={(event) => {
                                            const title = event.target.value
                                            const newTreeData = changeNodeAtPath({
                                                treeData: sidemenu.data,
                                                path,
                                                getNodeKey,
                                                newNode: { ...node, title },
                                            })
                                            setSideMenu({ ...sidemenu, data: newTreeData as any })
                                        }}
                                    />
                                    <Input
                                        width="150px"
                                        value={node.url}
                                        onChange={(event) => {
                                            const newTreeData = changeNodeAtPath({
                                                treeData: sidemenu.data,
                                                path,
                                                getNodeKey,
                                                newNode: { ...node, url: event.target.value },
                                            })
                                            setSideMenu({ ...sidemenu, data: newTreeData as any })
                                        }}
                                    />
                                    <Input
                                        width="120px"
                                        value={node.icon}
                                        onChange={(event) => {
                                            const icon = event.target.value
                                            const newTreeData = changeNodeAtPath({
                                                treeData: sidemenu.data,
                                                path,
                                                getNodeKey,
                                                newNode: { ...node, icon },
                                            })
                                            setSideMenu({ ...sidemenu, data: newTreeData as any })
                                        }}
                                        placeholder="icon name"
                                    />
                                    {!node.children?.length  && <Input
                                        width="140px"
                                        value={node.dashboardId}
                                        onChange={(event) => {
                                            const dashboardId = event.target.value
                                            const newTreeData = changeNodeAtPath({
                                                treeData: sidemenu.data,
                                                path,
                                                getNodeKey,
                                                newNode: { ...node, dashboardId },
                                            })
                                            setSideMenu({ ...sidemenu, data: newTreeData as any })
                                        }}
                                        placeholder="dashboard id"
                                    />}
                                    <Tooltip label={t1.removeMenuItem}>
                                        <Box onClick={() => removeMenuItem(node)}><Icons.FaTimes /></Box>
                                    </Tooltip>
                                </HStack>
                            )
                        },
                    })}
                />
            </Box>
        </Box>}
    </>
}

export default TeamSidemenuPage