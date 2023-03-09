import { Text } from "@chakra-ui/react"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"

// All of the paths that is not defined in pages will redirect to this page,
// generally these pages are defined by:
// 1. team's side menu, asscessed by a specific url path
// 2. dashboard page accessed by a dashboard id
const CustomPath2 = () => {
    const router = useRouter()
    return (
        <PageContainer>
            <Text> Hello,dashboard: {router.asPath}!</Text>
        </PageContainer>
    )
}

export default CustomPath2