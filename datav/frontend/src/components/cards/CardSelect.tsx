// Copyright 2023 xObserve.io Team

import React from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
} from '@chakra-ui/react'
import { isEmpty } from 'utils/validate'

interface Props {
  title: string
  children: any
}

const CardSelect = ({ title, children }: Props) => {
  return (
    <Card>
      {!isEmpty(title) && (
        <CardHeader pb='2' p='1' fontWeight='550' fontSize='0.9rem'>
          {title}
        </CardHeader>
      )}
      <CardBody pt='0' p='1'>
        <Stack divider={<StackDivider />} spacing='0'>
          {children}
        </Stack>
      </CardBody>
    </Card>
  )
}

export default CardSelect

interface ItemProps {
  children: any
  selected?: boolean
  onClick?: any
}

export const CardSelectItem = ({
  children,
  selected = false,
  onClick,
}: ItemProps) => {
  return (
    <Box
      className={`hover-bg ${selected ? 'highlight-bg' : ''}`}
      p='1'
      cursor='pointer'
      onClick={onClick}
      borderRadius={2}
    >
      {children}
    </Box>
  )
}
