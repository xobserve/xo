import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text, VStack } from "@chakra-ui/react"

const PanelAccordion = ({title, children }) => {
    return (
        <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
                <AccordionButton fontSize="sm" pl="0" py="2" _hover={{background:null}}>
                    <AccordionIcon />
                    <Text ml="1">{title}</Text>
                </AccordionButton>
                <AccordionPanel pb={4} pt="0">
                    <VStack alignItems="left">
                    {children}
                    </VStack>
                </AccordionPanel>
            </AccordionItem>

        </Accordion>
    )
}

export default PanelAccordion