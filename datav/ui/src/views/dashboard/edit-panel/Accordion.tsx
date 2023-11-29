// Copyright 2023 xObserve.io Team

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Text,
  VStack,
} from '@chakra-ui/react'
import React from 'react'

const PanelAccordion = ({
  title,
  colorTitle = false,
  children,
  defaultOpen = true,
  spacing = 4,
}) => {
  return (
    <Accordion defaultIndex={defaultOpen ? [0] : []} allowMultiple>
      <AccordionItem
        borderBottomWidth={'0 !important'}
        borderTopWidth={'0 !important'}
      >
        <AccordionButton
          width='fit-content'
          fontSize='0.95em'
          pl='0'
          py='3'
          _hover={{ background: null }}
        >
          <AccordionIcon />
          <Text ml='1' className={colorTitle && 'color-text'}>
            {title}
          </Text>
        </AccordionButton>
        <AccordionPanel pb={4} pt='0'>
          <VStack alignItems='left' spacing={spacing}>
            {children}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default PanelAccordion
