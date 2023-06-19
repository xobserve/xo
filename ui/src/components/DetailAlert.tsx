import { Alert, AlertDescription, AlertIcon, AlertStatus, AlertTitle, Box, Divider, Text } from "@chakra-ui/react"


interface Props {
    status: AlertStatus
    title: string
    children: any
}

export const DetailAlert = ({ status, title, children }: Props) => {
    return (
        <Alert
            status={status}
            variant='subtle'
            flexDirection='column'
            alignItems='left'
            justifyContent='center'
            width="fit-content"
        >
            <AlertIcon boxSize='40px' mr={0} />
            <AlertTitle mt={4} mb={4} fontSize='lg'>
                {title}
            </AlertTitle>
            <Divider />
            <Box mt="3" pb="1">
            {children}
            </Box>

        </Alert>
    )
}


interface Detail {
    title?: string
    children: any
}

export const DetailAlertItem = ({ title, children }: Detail) => {
    return (<AlertDescription mt="4">
        {title && <Box textStyle="subTitle">{title}</Box>}
            {children}
    </AlertDescription>)
}
