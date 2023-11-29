// Copyright 2023 xObserve.io Team

import React from 'react'
import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa'

const BackToTop = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const handleScroll = () => {
    const position = window.pageYOffset
    setScrollPosition(position)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {scrollPosition > 1500 && (
        <a href='#top'>
          <Box
            position='fixed'
            bottom='20px'
            right={['16px', '50px']}
            zIndex={1}
          >
            <Box
              aria-label='go to github'
              layerStyle='textSecondary'
              _focus={{ border: null }}
              fontWeight='300'
              width='1.8rem'
              onClick={() => (location.href = '#comments')}
            >
              <FaArrowUp />
            </Box>
          </Box>
        </a>
      )}
    </>
  )
}

export default BackToTop
