// Copyright 2023 xObserve.io Team

import {
  Box,
  Center,
  ChakraProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'
import { memo } from 'react'
import { FaQuestion } from 'react-icons/fa'
import { Help } from 'types/misc'
import React from 'react'

interface Props extends ChakraProps {
  data: Help[]
  size?: 'sm' | 'md' | 'lg'
  iconSize?: string
}

const HelpComponent = memo(
  ({ data, size = 'sm', iconSize = '0.9rem', ...rest }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
      <>
        <Tooltip label='click to view the help doc'>
          <Box {...rest} cursor='pointer' onClick={onOpen} fontSize={iconSize}>
            <FaQuestion />
          </Box>
        </Tooltip>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent minWidth='600px'>
            <ModalBody>
              {data.map((help) => (
                <Box key={help.title}>
                  <Center>
                    <Text textStyle='title'>{help.title}</Text>
                  </Center>
                  <Table
                    variant='simple'
                    size={size}
                    mt='2'
                    className='color-border-table'
                  >
                    <Thead>
                      <Tr>
                        {help.headers.map((header) => (
                          <Th key={header}>{header}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {help.contents.map((content, j) => (
                        <Tr key={j}>
                          {content.map((c, i) => (
                            <Td key={i} fontWeight={i == 0 ? 600 : 450}>
                              {c}
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  },
)

export default HelpComponent
