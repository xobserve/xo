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

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Text, VStack } from "@chakra-ui/react"
import React from "react";

const PanelAccordion = ({title, children ,defaultOpen=true}) => {
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