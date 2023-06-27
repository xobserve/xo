import { Button,  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure, VStack, Flex, Box, useToast, HStack, Image, Text } from "@chakra-ui/react"
import Page from "layouts/page/Page"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaCog } from "react-icons/fa"
import { cfgLinks } from "src/data/nav-links"
import ReserveUrls from "src/data/reserve-urls"
import DatasourceEditor from "src/views/datasource/Editor"
import { Datasource } from "types/datasource"
import { requestApi } from "utils/axios/request"

const TeamsPage = () => {
    const toast = useToast()
    const router = useRouter()
    const [datasources, setDatasources] = useState<Datasource[]>([])
    const [datasource, setDatasource] = useState<Datasource>(null)
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/datasource/all")
        setDatasources(res.data)
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    const onChange = () => {
        onClose()
        load()
    }
    return <>
        <Page title={`Configuration`} subTitle="Manage datasources" icon={<FaCog />} tabs={cfgLinks}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={() => router.push(ReserveUrls.New + '/datasource')}>Add new datasource</Button>
            </Flex>

            <VStack alignItems="left" spacing={3} mt="3">
                {
                    datasources.map(ds => <Flex key={ds.id} className="label-bg" p="4" alignItems="center" justifyContent="space-between">
                        <HStack>
                            <Image width="50px" height="50px" src={`/plugins/datasource/${ds.type}.svg`} />
                            <Box>
                                <Text fontWeight="550">{ds.name}</Text>
                                <Text textStyle="annotation" mt="1">{ds.type} | {ds.url}</Text>
                            </Box>
                        </HStack>
                        
                        <Button size="sm" variant="ghost" onClick={() => {
                            setDatasource(ds)
                            onOpen()
                        }}>Edit</Button>
                    </Flex>)
                }
            </VStack>
            
        </Page>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit datasource - {datasource?.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {datasource && <DatasourceEditor ds={datasource} onChange={onChange} />}
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}


export default TeamsPage