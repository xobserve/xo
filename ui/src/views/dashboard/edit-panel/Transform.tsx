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
import { Box, Text } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"
import { DetailAlert, DetailAlertItem } from "components/DetailAlert"
import React from "react"
import { commonMsg, panelMsg } from "src/i18n/locales/en"
import { Panel } from "types/dashboard"

interface Props {
    panel: Panel
    onChange: any
}

const EditPanelTransform = ({ panel, onChange }: Props) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)

    return (<>
        <Box my="2">
            <DetailAlert title={t.transform} status="info" width="100%">
                <DetailAlertItem>
                    <Text mt="2">{t1.transformTips}</Text>
                </DetailAlertItem>
            </DetailAlert>
        </Box>
        <CodeEditorModal value={panel.transform} onChange={v => {
            onChange((panel: Panel) => {
                panel.transform = v
            })
        }} />

    </>)
}

export default EditPanelTransform