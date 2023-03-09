import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import PageContainer1 from 'layouts/page-container'
import NextLink from 'next/link'
import * as React from 'react'
import { FaHome } from 'react-icons/fa'
import Header from 'src/layouts/header'
import { t } from 'utils/i18n'

const NotFoundPage = () => {
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
        <Heading>{t('notfound.heading')}</Heading>
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
