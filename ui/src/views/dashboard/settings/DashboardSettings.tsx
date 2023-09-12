// Copyright 2023 Datav.io Team
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
import {  Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure, useMediaQuery } from "@chakra-ui/react"
import IconButton from "src/components/button/IconButton"
import { toNumber } from "lodash"
import { useEffect } from "react"
import { FaCog } from "react-icons/fa"
import { useSearchParam } from "react-use"
import { Dashboard } from "types/dashboard"
import { addParamToUrl, removeParamFromUrl } from "utils/url"
import GeneralSettings from "./General"
import MetaSettings from "./MetaSetting"
import StyleSettings from "./Styles"
import VariablesSetting from "./Variables"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, dashboardSettingMsg } from "src/i18n/locales/en"
import AnnotationSettings from "./Annotation"
import { MobileBreakpoint } from "src/data/constants"

interface Props {
    dashboard: Dashboard
    onChange: any
}


enum DashboardSettingType  {
    General = 0,
    Styles = 1,
    Variables = 2,
    MetaData = 3,
    Annotation = 4
}
// color-scheme: dark;height: 100%;background-image: url(http://datav-react.jiaminghi.com/demo/manage-desk/static/media/bg.110420cf.png);background-size: auto;
const DashboardSettings = ({ dashboard,onChange }: Props) => {
    const t = useStore(commonMsg)
    const t1 = useStore(dashboardSettingMsg)

    const settings = useSearchParam('settings')
    useEffect(() => {
        if (settings) {
            onOpen()
        }
    }, [settings])

    const { isOpen, onOpen, onClose } = useDisclosure()


    const onSettingClose = () => {
        removeParamFromUrl(['settings'])
        onClose()
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    return (<>
        <IconButton onClick={() => addParamToUrl({ settings: DashboardSettingType.General })} variant="ghost"><FaCog /></IconButton>
        <Modal isOpen={isOpen} onClose={onSettingClose} size="full">
            <ModalOverlay />
            <ModalContent >
                <ModalCloseButton mt="2"/>
                <ModalBody p={isLargeScreen ? 2 : 1}>
                    <Text textStyle="subTitle" mt="2">{dashboard.title} / Settings</Text>
                    <Tabs orientation="vertical"  mt="7" defaultIndex={toNumber(settings)} onChange={index => addParamToUrl({ settings: index })}>
                        <TabList pr={isLargeScreen ? 2 : 0} width={isLargeScreen ? "200px" : "70px"} >
                            <Tab>{t.general}</Tab>
                            <Tab>{t.styles}</Tab>
                            <Tab>{t.variable}</Tab>
                            <Tab>{t.annotation}</Tab>
                            <Tab>{t1.metaData}</Tab>
                        </TabList>

                        <TabPanels  p={isLargeScreen ? 2 : 0}> 
                            <TabPanel py="0" tabIndex={DashboardSettingType.General}>
                                <GeneralSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel py="0" tabIndex={DashboardSettingType.Styles}>
                                <StyleSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel  py="0" tabIndex={DashboardSettingType.Variables}>
                                <VariablesSetting dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel  py="0" tabIndex={DashboardSettingType.Annotation}>
                                <AnnotationSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel  py="0" tabIndex={DashboardSettingType.MetaData}>
                                <MetaSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>)
}

export default DashboardSettings