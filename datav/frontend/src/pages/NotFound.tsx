// Copyright 2023 xobserve.io Team
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

import React from 'react'
import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import { FaHome } from 'react-icons/fa'
import { useStore } from '@nanostores/react'
import { notFoundMsg } from 'src/i18n/locales/en'

interface Props {
  message?: string
}

const NotFoundPage = ({ message }: Props) => {
  const t = useStore(notFoundMsg)
  return (
    <>
      {/* <Header /> */}
      <VStack
        justify='center'
        spacing='4'
        as='section'
        mt={['20', null, '40']}
        textAlign='center'
      >
        <Heading>{message ?? t.heading}</Heading>
        <Text fontSize={{ md: 'xl' }}>{t.message}</Text>
        <Button
          as='a'
          href='/'
          aria-label='Back to Home'
          leftIcon={<FaHome />}
          size='lg'
        >
          {t['back-to-home']}
        </Button>
      </VStack>
    </>
  )
}

export default NotFoundPage
