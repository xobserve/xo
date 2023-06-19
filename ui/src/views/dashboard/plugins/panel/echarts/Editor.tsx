import { Box, Button, Center, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Textarea, useColorMode, useDisclosure } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { EditorInputItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import { useState } from "react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { PanelEditorProps } from "types/dashboard"
import { EchartsComponent } from "./Echarts"


const EchartsPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<PanelAccordion title="Echarts setting">
        <ParseOptions panel={panel} onChange={v => {
            onChange(panel => {
                panel.plugins.echarts.parseOptionsFunc = v
            })
        }} />
    </PanelAccordion>
    )
}

export default EchartsPanelEditor


const ParseOptions = ({ panel, onChange }: PanelEditorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(panel.plugins.echarts.parseOptionsFunc)

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }

    const {colorMode} = useColorMode()
    const example = {
        title: {
            text: `Sunface's collections`
        },
        tooltip: {},
        xAxis: {
            data: ["My Books","My Shirts", "My Shoes"]
        },
        yAxis: {},
        series: [
            {
                name: 'Sunface',
                type: 'bar',
                data: [34, 7, 3]
            }
        ]
    }

    return (<>
        <PanelEditItem title="Parse options function" desc="Data fetched from datasource will pass to this function, and the return options will directly pass to echarts">
            <Button size="sm" onClick={onOpen}>Edit function</Button>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="800px" minHeight="800px">
                <ModalBody p="0">
                    <Box height="400px"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                    <Button onClick={onSubmit} width="100%">Submit</Button>
                    <Box mt="2">
                        <Center textStyle="subTitle">Here is an example of echarts options and the result it is rendering</Center>
                        <Center textStyle="title">( Find more examples: https://echarts.apache.org/examples/en/index.html )</Center>

                        <HStack spacing="0" alignItems="left">
                            <Box width="300px">
                                <Textarea height="700px" value={JSON.stringify(example, null, 2)} />
                            </Box>
                            <Box width="500px" key={colorMode}>
                                <EchartsComponent options={example} theme={colorMode} width={500} height={600} />
                            </Box>
                        </HStack>
                    </Box>
                </ModalBody>

            </ModalContent>
        </Modal>
    </> 
    )
}