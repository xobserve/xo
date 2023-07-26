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

import { Tag, TagCloseButton, TagLabel } from "@chakra-ui/react"
import React from "react"
import colorGenerator from "utils/colorGenerator"


interface Props {
    name: string
    onRemove?: any
    style?: Object
}
const ColorTag = ({ name, onRemove,style }: Props) => {
    return (
        <Tag style={style} bg={colorGenerator.getColorByKey(name)} color="#444" onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }} borderRadius={2}>
            <TagLabel>{name}</TagLabel>
            {onRemove && <TagCloseButton onClick={onRemove} />}
        </Tag>
    )
}

export default ColorTag