import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Text, VStack } from "@chakra-ui/react"

const PanelAccordion = ({title, children ,defaultOpen=false}) => {
    return (
        <Accordion defaultIndex={defaultOpen ? [0] : []} allowMultiple>
            <AccordionItem>
                <AccordionButton fontSize="sm" pl="0" py="3" _hover={{background:null}}>
                    <AccordionIcon />
                    <Text ml="1">{title}</Text>
                </AccordionButton>
                <AccordionPanel pb={4} pt="0">
                    <VStack alignItems="left" spacing="2">
                    {children}
                    </VStack>
                </AccordionPanel>
            </AccordionItem>

        </Accordion>
    )
}

export default PanelAccordion