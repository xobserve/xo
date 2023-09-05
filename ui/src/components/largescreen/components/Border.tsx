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
import { Box } from "@chakra-ui/react"
import BorderBox1 from "src/components/largescreen/border/Border1"
import BorderBox10 from "src/components/largescreen/border/Border10"
import BorderBox11 from "src/components/largescreen/border/Border11"
import BorderBox12 from "src/components/largescreen/border/Border12"
import BorderBox13 from "src/components/largescreen/border/Border13"
import BorderBox2 from "src/components/largescreen/border/Border2"
import BorderBox3 from "src/components/largescreen/border/Border3"
import BorderBox4 from "src/components/largescreen/border/Border4"
import BorderBox5 from "src/components/largescreen/border/Border5"
import BorderBox6 from "src/components/largescreen/border/Border6"
import BorderBox7 from "src/components/largescreen/border/Border7"
import BorderBox8 from "src/components/largescreen/border/Border8"
import BorderBox9 from "src/components/largescreen/border/Border9"
import { useRef } from "react"
import { PanelBorderType } from "types/panel/styles"
import React from "react"

const Border = ({ border, children,width,height }) => {
    const ref = useRef()
    switch (border) {
        case PanelBorderType.None:
            return <Box height={height} width={width}>{children}</Box>
        case PanelBorderType.Border1:
            return <BorderBox1 style={{width,height}}>{children}</BorderBox1>
        case PanelBorderType.Border2:
            return <BorderBox2 style={{width,height}}>{children}</BorderBox2>
        case  PanelBorderType.Border3 :
            return <BorderBox3 style={{width,height}}>{children}</BorderBox3>
        case PanelBorderType.Border4:
            return <BorderBox4 style={{width,height}}>{children}</BorderBox4>
        case PanelBorderType.Border5:
            return <BorderBox5 style={{width,height}}>{children}</BorderBox5>
        case PanelBorderType.Border6:
            return <BorderBox6 style={{width,height}}>{children}</BorderBox6>
        case PanelBorderType.Border7:
            return <BorderBox7 style={{width,height}}>{children}</BorderBox7>
        case PanelBorderType.Border8:
            return <BorderBox8 style={{width,height}} ref={ref}>{children}</BorderBox8>
        case PanelBorderType.Border9:
            return <BorderBox9 style={{width,height}}>{children}</BorderBox9>
        case PanelBorderType.Border10:
            return <BorderBox10 style={{width,height}}>{children}</BorderBox10>
        case PanelBorderType.Border11:
            return <BorderBox11 style={{width,height}}>{children}</BorderBox11>
        case PanelBorderType.Border12:
            return <BorderBox12 style={{width,height}}>{children}</BorderBox12>
        case PanelBorderType.Border13:
            return <BorderBox13 style={{width,height}}>{children}</BorderBox13>
        default:
            return <Box className="bordered" height={height} width={width}>{children}</Box>
    }
}


export default Border

