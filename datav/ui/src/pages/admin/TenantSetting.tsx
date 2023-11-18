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

import { useStore } from "@nanostores/react"
import Page from "layouts/page/Page"
import React, { memo, useEffect, useRef, useState } from "react"
import { cfgTeam, commonMsg } from "src/i18n/locales/en"
import { Input, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, useDisclosure, Box, Button, useToast, HStack, Switch, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, ModalHeader, Text } from "@chakra-ui/react"

import { requestApi } from "utils/axios/request"
import { FaUser } from "react-icons/fa"
import { Tenant } from "types/tenant"
import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import { cloneDeep } from "lodash"
import { getTenantLinks } from "./links"
import { $config } from "src/data/configs/config"
import { locale } from "src/i18n/i18n"
import { useNavigate } from "react-router-dom"
import { isAdmin, isSuperAdmin } from "types/role"
import { isEmpty } from "utils/validate"

export const TenantSetting = memo(() => {
    const config = useStore($config)
    const t = useStore(commonMsg)
    const t1 = useStore(cfgTeam)
    const lang = useStore(locale)
    const [tenant, setTenant] = useState<Tenant>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure()
    const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure()
    const { isOpen: isTransferAlertOpen, onOpen: onTransferAlertOpen, onClose: onTransferAlertClose } = useDisclosure()

    const [transferTo, setTransferTo] = useState<string>(null)
    const cancelRef = useRef()
    const toast = useToast()
    const navigate = useNavigate()

    const tenantLinks = getTenantLinks(config.currentTeam)


    useEffect(() => {
        load()
    }, [])


    const load = async () => {
        const res = await requestApi.get(`/tenant/byId/${config.currentTenant}`)
        setTenant(res.data)
    }


    const deleteTenant = async () => {
        await requestApi.delete(`/tenant/${tenant.id}`)
        toast({
            title: t.isDeleted({ name: t.team }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            window.location.href = `/`
        }, 1000)
    }

    const leaveTenant = async () => {
        await requestApi.post(`/tenant/leave/${tenant.id}`)
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

    const transferTenant = async () => {
        if (isEmpty(transferTo)) {
            toast({
                title: t.isReqiiured({ name: t.userName }),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        await requestApi.post(`/tenant/transfer/${config.currentTenant}/${transferTo}`)
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

    const updateTenant = async () => {
        await requestApi.post(`/tenant/update`, tenant)
        toast({
            title: t.isUpdated({ name: t.team }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    return <Page title={lang == "en" ? `Tenant Admin - ${config.tenantName}` : `租户管理 - ${config.tenantName}`} subTitle={t.settings} icon={<FaUser />} tabs={tenantLinks}>
        {tenant && <>
            <Box>
                <Form width="500px">
                    <FormSection title={t.basicSetting}>
                        <FormItem title={t.itemName({ name: t.tenant })} labelWidth="150px">
                            <Input placeholder="******" value={tenant.name} onChange={e => { tenant.name = e.currentTarget.value; setTenant(cloneDeep(tenant)) }} />
                        </FormItem>
                        <FormItem title={t1.isPublic} desc={t1.isPublicTips} labelWidth="150px" alignItems="center">
                            <Switch isChecked={tenant.isPublic} onChange={e => { tenant.isPublic = e.currentTarget.checked; setTenant(cloneDeep(tenant)) }} />
                        </FormItem>
                    </FormSection>
                    <Button width="fit-content" size="sm" onClick={updateTenant} >{t.submit}</Button>


                    <FormSection title={t.dangeSection}>
                        {isSuperAdmin(config.tenantRole) ? <HStack spacing={2}>
                            <Button width="fit-content" variant="outline" onClick={onTransferOpen} colorScheme="orange">{t1.transferTenant}</Button>
                            <Button width="fit-content" onClick={onOpen} colorScheme="red">{t.deleteItem({ name: t.tenant })}</Button>
                        </HStack> :
                            <Button width="fit-content" onClick={onLeaveOpen} colorScheme="red">{t1.leaveTenant}</Button>}
                    </FormSection>
                </Form>
            </Box>
            <AlertDialog
                isOpen={isLeaveOpen}
                onClose={onLeaveClose}
                leastDestructiveRef={cancelRef}
            >
                <AlertDialogOverlay>
                    {tenant && <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            {t1.leaveTeam} - {tenant.name}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t.deleteAlert}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onLeaveClose}>
                                {t.cancel}
                            </Button>
                            <Button colorScheme='orange' onClick={leaveTenant} ml={3}>
                                {t1.leaveTenant}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>}
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isOpen}
                onClose={onClose}
                leastDestructiveRef={cancelRef}
            >
                <AlertDialogOverlay>
                    {tenant && <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            {t.deleteItem({ name: t.tenant })} - {tenant.name}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t.deleteAlert}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t.cancel}
                            </Button>
                            <Button colorScheme='orange' onClick={deleteTenant} ml={3}>
                                {t.delete}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>}
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isTransferAlertOpen}
                onClose={onTransferAlertClose}
                leastDestructiveRef={cancelRef}
            >
                <AlertDialogOverlay>
                    {tenant && <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            {t1.transferTenant} tenant `{tenant.name}` to user `{transferTo}`
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t1.transferAlert}
                            <Text mt="2" fontWeight={550}>{t1.transferAlertTips}</Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} variant="unstyled" onClick={onTransferAlertClose}>
                                {t.cancel}
                            </Button>
                            <Button colorScheme='orange' onDoubleClick={transferTenant} ml={3}>
                                {t.submit}
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
        </>}
    </Page >
})

export default TenantSetting