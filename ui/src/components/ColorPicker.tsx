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
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Button,
    Box,
    HStack,
    Text,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    useColorModeValue,
    Flex,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";
import { darkPalettes, lightPalettes, paletteColorNameToHex } from "utils/colors";
import { upperFirst } from "lodash";
import customColors from "theme/colors";
import { SketchPicker } from "react-color";

interface Props {
    color: string
    onChange: any
    buttonText?: string
    circlePicker?: boolean
    circleRadius?: string
}

export const ColorPicker = (props: Props) => {
    if (!props.color) {
        props.onChange('inherit')
        return 
    }

    const { onChange, buttonText = null, circlePicker = false, circleRadius = "16px" } = props
    const {colorMode} = useColorMode()
    const t = useStore(commonMsg)
    const color = paletteColorNameToHex(props.color, colorMode)
    return (
        <Popover>
            <PopoverTrigger><HStack width="fit-content">
                {circlePicker ?
                 <Box width="20px" height="20px" bg={color} borderRadius="50%" className="bordered"></Box> 
                : <>
                    <Button size="sm" width="fit-content" variant="ghost" >{buttonText ?? t.pickColor}</Button>
                    <Box width={circleRadius} height={circleRadius} bg={color} borderRadius="50%" className="bordered"></Box>
                    {/* <Text textStyle="annotation">{color}</Text> */}
                </>}

            </HStack></PopoverTrigger>
            <PopoverContent width={270}>
                <Tabs isFitted>
                    <TabList mb='1em'>
                        <Tab>{t.palette}</Tab>
                        <Tab>{t.custom}</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel pt="1">
                            <VStack alignItems="left" spacing={3}>
                            {
                                (colorMode == "light" ? lightPalettes : darkPalettes).map(palette => <Flex justifyContent="space-between" alignItems="center">
                                    <Text fontSize="0.9rem">{upperFirst(palette.name)}</Text>
                                    <HStack spacing={3}>
                                        {palette.shades.map((c,i) => <Box p="1px" borderRadius={4} border={props.color == c.name ? `1.5px solid ${c.color}` : null}><Box cursor="pointer"  borderRadius="50%" width={i==2 ? "30px" : "20px"} height={i==2 ? "30px" : "20px"} display="block" bg={c.color} onClick={() => onChange(c.name)}/></Box>)}
                                    </HStack>
                                </Flex>)
                            }
                            </VStack>

                            <HStack mt="3" spacing={4}>
                                <HStack>
                                    <Text fontSize="0.8rem">Transparent</Text>
                                    <Box p="1px" borderRadius={4} className={props.color === 'transparent' ? 'bordered' : null} ><Box cursor="pointer" width="20px" height="20px" bg='transparent' borderRadius="50%" className="bordered" onClick={() => onChange('transparent')}/></Box>
                                </HStack>
                                <HStack>
                                    <Text fontSize="0.8rem">Inherit</Text>
                                    <Box p="1px" borderRadius={4} className={props.color === 'inherit' ? 'bordered' : null}><Box cursor="pointer" width="20px" height="20px" bg={useColorModeValue(customColors.textColor.light, customColors.textColor.dark)} borderRadius="50%" className="bordered" onClick={() => onChange('inherit')} /></Box>
                                </HStack>
                            </HStack>
                        </TabPanel>
                        <TabPanel>
                        <SketchPicker
                        disableAlpha={false}
                            width="100%"
                            color={color}
                            onChange={v => onChange(v.hex)}
                            presetColors={[]}
                        />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};
