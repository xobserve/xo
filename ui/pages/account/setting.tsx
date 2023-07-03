import { Box, Button, Heading, Input, InputGroup, InputLeftAddon, useToast, VStack } from "@chakra-ui/react";
import FormItem from "components/form/Item";
import useSession from "hooks/use-session";
import Page from "layouts/page/Page"
import { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { accountLinks } from "src/data/nav-links";
import { requestApi } from "utils/axios/request";
import isEmail from "validator/lib/isEmail";

const AccountSetting = () => {
    const toast = useToast()
    const { session } = useSession();
    const [oldpw, setOldpw] = useState('')
    const [newpw, setNewpw] = useState('')
    const [confirmpw, setConfirmpw] = useState('')

    const [email, setEmail] = useState('')
    const [name, setName] = useState('')

    useEffect(() => {
        if (session) {
            setEmail(session.user.email)
            setName(session.user.name)
        }
    }, [session])

    const updateAccount = async () => {
        if (!email || !isEmail(email)) {
            toast({
                description: "email format is incorrect",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        if (!name) {
            toast({
                description: "name cannot be empty",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        await requestApi.post('/account/info', { id: session.user.id, email, name })
        toast({
            description: "account updated!",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    }

    const updatePassword = async () => {
        if (!oldpw) {
            toast({
                description: "old password cannot be empty",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        if (newpw.length < 5 || confirmpw.length < 5) {
            toast({
                description: "new password must be at least 6 characters long",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        if (newpw !== confirmpw) {
            toast({
                description: "new passwords do not match",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        await requestApi.post('/account/password', { newpw, oldpw, confirmpw })
        toast({
            description: "password updated!",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    }

    return (
        <Page title={`Account setting - ${session?.user.username}`} subTitle="Settings for user" icon={<FaUserAlt />} tabs={accountLinks}>
            <Box alignItems="left" maxW="600px">
                <VStack alignItems="left" spacing={4}>
                    <Box mb="2" textStyle="subTitle">Basic Information</Box>
                    <FormItem title="Nickname" labelWidth="200px">
                        <Input placeholder='give yourself a nick name' value={name} onChange={e => setName(e.currentTarget.value)} />
                    </FormItem>
                    <FormItem title='Email' labelWidth="200px">
                        <Input type='email' placeholder='enter a valid email' value={email} onChange={e => setEmail(e.currentTarget.value.trim())} />
                    </FormItem>
                    <Button width="fit-content" onClick={updateAccount}>Submit</Button>
                </VStack>

                <VStack alignItems="left" mt="8" spacing={3}>
                    <Box mb="2" textStyle="subTitle">Change Password</Box>
                    <FormItem title='Old password' labelWidth="200px">
                        <Input type="password" placeholder="******" value={oldpw} onChange={e => setOldpw(e.currentTarget.value.trim())} />
                    </FormItem>
                    <FormItem title='New password' labelWidth="200px">
                        <Input type="password" placeholder="******" value={newpw} onChange={e => setNewpw(e.currentTarget.value.trim())} />
                    </FormItem>
                    <FormItem title='Confirm new password' labelWidth="200px">
                        <Input type="password" placeholder="******" value={confirmpw} onChange={e => setConfirmpw(e.currentTarget.value.trim())} />
                    </FormItem>
                    <Button width="fit-content" onClick={updatePassword}>Submit</Button>
                </VStack>
            </Box>
        </Page>
    )
}

export default AccountSetting