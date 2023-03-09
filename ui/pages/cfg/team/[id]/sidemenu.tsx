import { Box, Input, InputGroup, InputLeftAddon, useDisclosure, useToast, VStack, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, HStack, useColorModeValue, Alert, AlertIcon, Text, Flex, Button } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { Route } from "types/route"
import { SideMenu, Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import React, { Component } from 'react';
import SortableTree, { changeNodeAtPath } from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css';
import * as Icons from 'react-icons/fa'

const TeamSettingPage = () => {
    const router = useRouter()
    const toast = useToast()
    const id = router.query.id


    const [team, setTeam] = useState<Team>(null)
    const [sidemenu, setSideMenu] = useState<SideMenu>()


    const getNodeKey = ({ treeIndex }) => treeIndex

    useEffect(() => {
        if (id) {
            load()
            loadSidemenu()
        }
    }, [id])

    const tabLinks: Route[] = [
        { title: "Members", url: `/cfg/team/${id}/members`, icon: <FaUserFriends /> },
        { title: "Side menu", url: `/cfg/team/${id}/sidemenu`, icon: <FaAlignLeft /> },
        { title: "Setting", url: `/cfg/team/${id}/setting`, icon: <FaCog /> },
    ]




    const load = async () => {
        const res = await requestApi.get(`/team/${id}`)
        setTeam(res.data)

    }

    const loadSidemenu = async () => {
        const res = await requestApi.get(`/team/sidemenu/${id}`)
        setSideMenu(res.data)
    }

    const updateSidemenu = async () => {
        for (let i = 0; i < sidemenu.data.length; i++) {
            const item = sidemenu.data[i]

            if (!item.icon) {
                toast({
                    title: `Menu item of level 1 must have an icon`,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            }

            const icon = Icons[item.icon]
            if (!icon) {
                toast({
                    title: `icon ${item.icon} is not exist`,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            }

            if (!item.url.startsWith('/') || item.url === '/' || item.url.endsWith('/')) {
                toast({
                    title: `"${item.url}" is not a valid url`,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            }

            const parts = item.url.split('/').length
            if (parts != 2) {
                toast({
                    title: `level 1 url must be /x, /x/y is invalid`,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
                return 
            } 

            if (item.children) {
                for (let i = 0; i < item.children.length; i++) {
                    const childItem = item.children[i]
                    if (!childItem.url.startsWith('/') || childItem.url === '/' || childItem.url.endsWith('/')) {
                        toast({
                            title: `"${childItem.url}" is not a valid url`,
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                        })
                        return 
                    }
        
                    const parts = childItem.url.split('/').length
                    if (parts != 3) {
                        toast({
                            title: `level 2 url must be /x/y, /x or /x/y/z is invalid`,
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
            title: "Side menu updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }


    return <>
        {id && sidemenu && team && <Page title={`Manage your team`} subTitle={`Current team - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
            <Alert status='info' maxWidth="700px" flexDirection="column" alignItems="left">
                <Text>Customize the top section of your team's side menu, you can add, edit, delete and reorder the menu items.</Text>

                <Text mt="4">Menu item format: &nbsp; <b>title | url | icon</b> <br /></Text>

                <Text mt="4">url format:</Text>
                <Text mt="2">&nbsp;&nbsp;level 1: /x, /y, /z</Text>
                <Text mt="2">&nbsp;&nbsp;level 2: if level 1 is /x, level 2 must be /x/a or /x/b, obviously /y/a is invalid</Text>

                <Text mt="4">You can find icons in https://react-icons.github.io/react-icons/icons?name=fa</Text>
            </Alert>
            <Flex justifyContent="space-between" my="4" maxWidth="700px">
                <Box textStyle="subTitle">Modify sidemenu</Box>
                <Button onClick={updateSidemenu}>Submit</Button>
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
                                    {Icon && <Box width="30px" fontSize="25px">{Icon && <Icon />}</Box>}
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

                                </HStack>
                            )
                        },
                    })}
                />
            </Box>
        </Page>}
    </>
}

export default TeamSettingPage