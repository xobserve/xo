import { Box, Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { useState } from "react"
import { FaCog } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import VariablesSetting from "./Variables"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const DashboardSettings = ({ dashboard,onChange }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (<>
        <IconButton onClick={onOpen}><FaCog /></IconButton>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalBody>
                    <Text textStyle="subTitle">{dashboard.title} / Settings</Text>
                    <Tabs orientation="vertical" variant='soft-rounded' mt="4">
                        <TabList>
                            <Tab>General</Tab>
                            <Tab>Variables</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <p>one!</p>
                            </TabPanel>
                            <TabPanel>
                                <VariablesSetting dashboard={dashboard} onChange={onChange} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>)
}

export default DashboardSettings