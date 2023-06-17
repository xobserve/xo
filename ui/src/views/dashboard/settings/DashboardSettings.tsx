import {  Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { FaCog } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import GeneralSettings from "./General"
import MetaSettings from "./MetaSetting"
import StyleSettings from "./Styles"
import VariablesSetting from "./Variables"

interface Props {
    dashboard: Dashboard
    onChange: any
}


// color-scheme: dark;height: 100%;background-image: url(http://datav-react.jiaminghi.com/demo/manage-desk/static/media/bg.110420cf.png);background-size: auto;
const DashboardSettings = ({ dashboard,onChange }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (<>
        <IconButton onClick={onOpen} variant="ghost"><FaCog /></IconButton>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton mt="2"/>
                <ModalBody>
                    <Text textStyle="subTitle" mt="2">{dashboard.title} / Settings</Text>
                    <Tabs orientation="vertical" variant='soft-rounded' mt="7">
                        <TabList pr="2" width="200px" >
                            <Tab>General</Tab>
                            <Tab>Styles</Tab>
                            <Tab>Variables</Tab>
                            <Tab>Meta data</Tab>
                        </TabList>

                        <TabPanels className="bordered" p="2"> 
                            <TabPanel py="0">
                                <GeneralSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel py="0">
                                <StyleSettings dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel  py="0">
                                <VariablesSetting dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                            <TabPanel  py="0">
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