import React from 'react'
import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import PageContainer1 from 'layouts/page-container'
import { FaHome } from 'react-icons/fa'
import { useStore } from '@nanostores/react'
import { notFoundMsg } from 'src/i18n/locales/en'



interface Props {
  message?: string
}


const NotFoundPage = ({message}:Props) => {
  const t = useStore(notFoundMsg)
  return (
    <PageContainer1>
      {/* <Header /> */}
      <VStack
        justify='center'
        spacing='4'
        as='section'
        mt={['20', null, '40']}
        textAlign='center'
      >
        <Heading>{message??t.heading}</Heading>
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
    </PageContainer1>
  )
}

export default NotFoundPage
