import { Box, Card, CardBody, CardHeader, Stack, StackDivider } from "@chakra-ui/react"


interface Props {
    title: string
    children: any
}

const CardSelect = ({title,children}:Props) => {
    return (
        <Card>
            <CardHeader pb="2" p="2" fontWeight="bold">{title}</CardHeader>
            <CardBody pt="0" p="2">
                <Stack divider={<StackDivider />} spacing='2'>
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

export const CardSelectItem = ({ children,selected=false, onClick }:ItemProps) => {
    return (
        <Box className={`hover-bg ${selected ? 'highlight-bg' : ''}`} p="2" cursor="pointer" onClick={onClick}>
            {children}
        </Box>)
}