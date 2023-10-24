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
import React from "react"
import { PanelStyles, PanelTitleDecorationType } from "types/panel/styles"
import Decoration11 from "../decoration/Decoration11";
import Decoration7 from "../decoration/Decoration7";
import { Center } from "@chakra-ui/react";

interface Props {
    styles: PanelStyles
    children?: any
}

const TitleDecoration = ({ styles, children }: Props) => {
    const style = { width: styles?.title.decoration.width, height: styles?.title.decoration.height }

    let item: any
    switch (styles?.title.decoration.type) {
        case PanelTitleDecorationType.Decoration7:
            item = <Decoration7 style={style} margin={styles.title.decoration.margin}>{children}</Decoration7>
            break
        case PanelTitleDecorationType.Decoration11:
            item = <Decoration11 style={style} margin={styles.title.decoration.margin}>{children}</Decoration11>
            break
        default:
            item = children
            break
    }

    return styles.title.align === 'center' ? <Center>{item}</Center> : <>{item}</>
}

export default TitleDecoration