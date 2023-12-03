// Copyright 2023 xObserve.io Team

import React from 'react'
import { Button, useColorModeValue } from '@chakra-ui/react'

const IconButton = ({
  children,
  fontSize = '1.1rem',
  variant = 'outline',
  size = 'md',
  ...rest
}) => {
  return (
    <Button
      size={size}
      variant={variant}
      p='0'
      borderColor='inherit'
      color={useColorModeValue(
        'var(--chakra-colors-gray-600)',
        'var(--chakra-colors-whiteAlpha-900)',
      )}
      fontSize={fontSize}
      sx={{
        span: {
          display: 'flex',
          justifyContent: 'center',
        },
      }}
      {...rest}
    >
      {children}
    </Button>
  )
}

export default IconButton
