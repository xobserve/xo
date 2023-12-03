// Copyright 2023 xObserve.io Team

import React from 'react'
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'

import {
  PanelDecorationType,
  PanelTitleDecorationType,
} from 'types/panel/styles'
import Decoration from './Decoration'

interface Props {
  value: string
  onChange: any
}

const DecorationSelect = ({ value, onChange }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button variant='outline' size='sm' onClick={onOpen}>
        {value}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <VStack alignItems='left' spacing={2}>
              {Object.keys(PanelDecorationType).map((key) => {
                return (
                  <HStack
                    width='300px'
                    className={
                      PanelDecorationType[key] == value
                        ? 'highlight-bordered hover-bg'
                        : 'hover-bg'
                    }
                    alignItems='top'
                    cursor='pointer'
                    p='2'
                    onClick={() => {
                      onChange(PanelDecorationType[key])
                      onClose()
                    }}
                    sx={{
                      '.dv-decoration-1': {
                        zIndex: '2000!important',
                      },
                    }}
                  >
                    <Text>{key}</Text>
                    <Decoration
                      decoration={{
                        type: PanelDecorationType[key],
                        width: '150px',
                        height: '20px',
                        top: '',
                        left: '150px',
                        justifyContent: 'center',
                        reverse: false,
                      }}
                    />
                  </HStack>
                )
              })}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DecorationSelect
