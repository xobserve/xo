// Copyright 2023 xObserve.io Team
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
import CustomSelect from "src/components/select/AntdSelect"
import { Select } from "antd";
import ColorTag from "src/components/ColorTag";
import type { CustomTagProps } from 'rc-select/lib/BaseSelect';
import React from "react";
import { FaTag } from "react-icons/fa";
import { Box } from "@chakra-ui/react";
import { useStore } from "@nanostores/react";
import { componentsMsg } from "src/i18n/locales/en";
const { Option } = Select;

interface Props {
    tags: string[]
    value: string[]
    onChange: any
    tagCount?: Object
    minWidth?: string
}

const TagsFilter = ({ value, tags, onChange, tagCount = {}, minWidth = "260px" }: Props) => {
    const t1 = useStore(componentsMsg)
    const tagRender = (props: CustomTagProps) => {
        const { value, onClose } = props;
        return (
            <ColorTag
                name={value}
                onRemove={onClose}
                style={{ marginRight: 3 }}
            />
        );
    };

    return (
        <>
            <CustomSelect
                prefixIcon={
                    <Box color="gray.500">
                        <FaTag />
                    </Box>
                }
                placeholder={t1.filterTags}
                size="middle"
                allowClear
                mode="multiple"
                style={{ width: 'fit-content', minWidth: minWidth }}
                value={value}
                tagRender={tagRender}
                onChange={onChange}
                
            >
                {
                    tags.sort().map(tag => {
                        return <Option value={tag} label={tag + ` (${tagCount[tag] ?? 0})`}>
                            <ColorTag name={tag} label={tag + ` (${tagCount[tag] ?? 0})`} />
                        </Option>
                    })
                }
            </CustomSelect>

        </>
    )
}

export default TagsFilter