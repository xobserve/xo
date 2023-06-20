import { Box, Button, Center, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Textarea, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { clone, cloneDeep, isFunction } from "lodash"
import { useEffect, useState } from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { PanelDataEvent } from "src/data/bus-events"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { PanelEditorProps } from "types/dashboard"
import useBus from "use-bus"
import { genDynamicFunction } from "utils/dynamicCode"
import { EchartsComponent } from "./Echarts"
import * as echarts from 'echarts';
import { ColorModeSwitcher } from "components/ColorModeSwitcher"

const EchartsPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<PanelAccordion title="Echarts setting">
        <SetOptions panel={panel} onChange={v => {
            onChange(panel => {
                panel.plugins.echarts.setOptionsFunc = v
            })
        }} />

        <RegisterEvents panel={panel} onChange={v => {
            onChange(panel => {
                panel.plugins.echarts.registerEventsFunc = v
            })
        }} />
    </PanelAccordion>
    )
}

export default EchartsPanelEditor


const SetOptions = ({ panel, onChange }: PanelEditorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(panel.plugins.echarts.setOptionsFunc)
    const [data, setData] = useState(null)
    const onSubmit = () => {
        onChange(temp)
        onClose()
    }

    const { colorMode } = useColorMode()

    useBus(
        (e) => { return e.type == PanelDataEvent },
        (e) => {
            setData(e.data)
        }
    )


    const setOptions = genDynamicFunction(temp);
    let options;

    if (isFunction(setOptions)) {
        try {
            let o = setOptions(cloneDeep(data), echarts)
            o.animation = false
            options = o
        } catch (error) {
            console.log("call setOptions error", error)
        }

    }

    return (<>
        <PanelEditItem title="Set options function" desc="Data fetched from datasource will pass to this function, and the return options will directly pass to echarts">
            <Button size="sm" onClick={onOpen}>Edit function</Button>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>

                <ModalBody pt="2" pb="0" px="0">
                    <Flex alignItems="center" justifyContent="space-between" height="40px" pl="5">
                        <Text textStyle="subTitle"> Live Edit( fetch data from {panel.datasource.type} datasource)</Text>
                        <HStack>
                            <ColorModeSwitcher />
                            <Button size="sm" onClick={onSubmit} >Submit</Button>
                            <Button size="sm" onClick={onClose} variant="outline">Cancel</Button>
                        </HStack>
                    </Flex>
                    <HStack alignItems="top" height="calc(100vh - 50px)">
                        <Box width="45%"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                        <Box width="55%">
                            <Box height="50%">
                                <CodeEditor value={"//options return from setOptions func\n" + JSON.stringify(options, null, 2)} language="json" readonly />
                            </Box>
                            <Box key={colorMode} height="50%">
                                {options && <AutoSizer>
                                    {({ width, height }) => {
                                        return <EchartsComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={() => null} />
                                    }}
                                </AutoSizer>}
                            </Box>
                        </Box>
                    </HStack>



                </ModalBody>

            </ModalContent>
        </Modal>
    </>
    )
}



const RegisterEvents = ({ panel, onChange }: PanelEditorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(panel.plugins.echarts.registerEventsFunc)

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }

    return (<>
        <PanelEditItem title="Register events function" desc="custom your chart events, e.g mouseclick, mouseover etc">
            <Button size="sm" onClick={onOpen}>Edit function</Button>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader py="2">
                    Edit registerEvents function
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody pt="2" pb="0" px="0">
                    <Box height="400px"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                    <Button onClick={onSubmit} width="100%">Submit</Button>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>
    )
}