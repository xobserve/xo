import {
  Text,
  Link,
  VStack,
  Code,
} from "@chakra-ui/react"
import { t } from "utils/i18n"
import PageContainer from "layouts/page-container"

const IndexPage = () => {
  return (
    <PageContainer>
      <VStack spacing={8} alignItems="left">
        <Text>
          Edit <Code fontSize="xl">src/App.tsx</Code> and save to reload.
        </Text>
        <Link
          color="brand.700"
          href="https://chakra-ui.com"
          fontSize="2xl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('homepage.title.main')}
        </Link>
      </VStack>
    </PageContainer>
  )
}

export default IndexPage