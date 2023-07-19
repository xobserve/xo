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
import React from "react";
import { SketchPicker } from "react-color";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Center,
    Button,
    Box,
} from "@chakra-ui/react";
import { PresetColor } from "react-color/lib/components/sketch/Sketch";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";

interface Props {
    presetColors?: PresetColor[]
    color: string
    onChange: any
    buttonText?: string
}

export const ColorPicker = (props:Props) => {
    const t = useStore(commonMsg)
    return (
        <Popover>
            <PopoverTrigger><Button size="sm" width="fit-content">{props.buttonText ?? t.pickColor}</Button></PopoverTrigger>
            <PopoverContent width={300}>
                <Center>
                    <SketchPicker
                        // disableAlpha={true}
                        presetColors={props.presetColors}
                        width="100%"
                        color={props.color}
                        onChange={props.onChange}
                    />
                </Center>
            </PopoverContent>
        </Popover>
    );
};
