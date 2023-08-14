// Copyright 2023 Datav.io Team
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

import { useStore } from "@nanostores/react"
import Page from "layouts/page/Page"
import React, { useState } from "react"
import { adminLinks } from "src/data/nav-links"
import { commonMsg } from "src/i18n/locales/en"
import { MdOutlineAdminPanelSettings } from "react-icons/md"
import { Box, Button, Input, VStack } from "@chakra-ui/react"
import FormItem from "components/form/Item"

import { config } from "src/data/configs/config"
export const AdminPage = () => {
    const t = useStore(commonMsg)

    const [settings, setSettings] = useState(null)

    return <Page title={t.Admin} subTitle={"Manage datav settings"} icon={<MdOutlineAdminPanelSettings  />} tabs={adminLinks}>
            <Box maxW="600px">
                <VStack alignItems="left" spacing={4}>
                    <Box mb="2" textStyle="subTitle">{t.basicSetting}</Box>
                    <FormItem title={t.nickname} labelWidth="200px">
                        {/* <Input placeholder='give yourself a nick name' value={name} onChange={e => setName(e.currentTarget.value)} /> */}
                    </FormItem>
                    <FormItem title={t.email} labelWidth="200px">
                        {/* <Input type='email' placeholder='enter a valid email' value={email} onChange={e => setEmail(e.currentTarget.value.trim())} /> */}
                    </FormItem>
                    <Button width="fit-content">{t.submit}</Button>
                </VStack>
            </Box>
    </Page>
}

export default AdminPage