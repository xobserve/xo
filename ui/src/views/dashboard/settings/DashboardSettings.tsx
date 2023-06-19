import {  Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
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

interface Props {
    dashboard: Dashboard
    onChange: any
}


enum DashboardSettingType  {
    General = 0,
    Styles = 1,
    Variables = 2,
    MetaData = 3
}
// color-scheme: dark;height: 100%;background-image: url(http://datav-react.jiaminghi.com/demo/manage-desk/static/media/bg.110420cf.png);background-size: auto;
const DashboardSettings = ({ dashboard,onChange }: Props) => {
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
    return (<>
        <IconButton onClick={() => addParamToUrl({ settings: DashboardSettingType.General })} variant="ghost"><FaCog /></IconButton>
        <Modal isOpen={isOpen} onClose={onSettingClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton mt="2"/>
                <ModalBody>
                    <Text textStyle="subTitle" mt="2">{dashboard.title} / Settings</Text>
                    <Tabs orientation="vertical"  mt="7" defaultIndex={toNumber(settings)} onChange={index => addParamToUrl({ settings: index })}>
                        <TabList pr="2" width="200px" >
                            <Tab>General</Tab>
                            <Tab>Styles</Tab>
                            <Tab>Variables</Tab>
                            <Tab>Meta data</Tab>
                        </TabList>

                        <TabPanels  p="2"> 
                            <TabPanel py="0" tabIndex={DashboardSettingType.General}>
                                <GeneralSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel py="0" tabIndex={DashboardSettingType.Styles}>
                                <StyleSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel  py="0" tabIndex={DashboardSettingType.Variables}>
                                <VariablesSetting dashboard={dashboard} onChange={onChange} />
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