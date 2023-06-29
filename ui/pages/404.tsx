import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import PageContainer1 from 'layouts/page-container'
import * as React from 'react'
import { FaHome } from 'react-icons/fa'
import { t } from 'src/i18n'

interface Props {
  message?: string
}

const NotFoundPage = ({message}:Props) => {
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
        <Heading>{message??t('notfound.heading')}</Heading>
        <Text fontSize={{ md: 'xl' }}>{t('notfound.message')}</Text>
          <Button
            as='a'
            href='/'
            aria-label='Back to Home'
            leftIcon={<FaHome />}
            size='lg'
          >
            {t('notfound.back-to-home')}
          </Button>
      </VStack>
    </PageContainer1>
  )
}

export default NotFoundPage
