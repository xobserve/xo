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
    Divider,
    Wrap,
    Portal,
} from "@chakra-ui/react";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";
import { colors, colors1, colors2, colors3, darkPalettes, lightPalettes, paletteColorNameToHex } from "utils/colors";
import { upperFirst } from "lodash";
import customColors from "theme/colors";
import { SketchPicker } from "react-color";

interface Props {
    color: string
    defaultColor?: string
    onChange: any
    buttonText?: string
    circlePicker?: boolean
    circleRadius?: string
    presetColors?: {label: string;value: string}[]
}

export const ColorPicker = (props: Props) => {
    if (!props.color) {
        props.onChange(props.defaultColor ?? 'inherit')
        return 
    }

    const { onChange, buttonText = null, circlePicker = false, circleRadius = "16px",presetColors=[] } = props
    const {colorMode} = useColorMode()
    const t = useStore(commonMsg)
    const color = paletteColorNameToHex(props.color, colorMode)
    return (
        <Popover>
            <PopoverTrigger><HStack width="fit-content" cursor="pointer">
                {circlePicker ?
                 <Box width="20px" height="20px" bg={color == "inherit" ? useColorModeValue(customColors.textColor.light, customColors.textColor.dark) : color} borderRadius="50%" className="bordered"></Box> 
                : <>
                    <Button size="sm" width="fit-content" variant="text" className="color-text">{buttonText ?? t.pickColor}</Button>
                    <Box width={circleRadius} height={circleRadius} bg={color == "inherit" ? useColorModeValue(customColors.textColor.light, customColors.textColor.dark) : color} borderRadius="50%" className="bordered"></Box>
                    {/* <Text textStyle="annotation">{color}</Text> */}
                </>}

            </HStack></PopoverTrigger>
            <Portal>
            <PopoverContent width={300}>
                <Tabs isFitted>
                    <TabList mb='1em'>
                        <Tab>{t.palette}</Tab>
                        <Tab>{t.custom}</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel pt="1">
                            <VStack alignItems="left" spacing={1} px="1">
                            {
                                (colorMode == "light" ? lightPalettes : darkPalettes).map(palette => <Flex justifyContent="space-between" alignItems="center">
                                    <Text fontSize="0.9rem">{upperFirst(palette.name)}</Text>
                                    <HStack spacing={3}>
                                        {palette.shades.map((c,i) => <Palette name={c.name} color={c.color} currentColor={props.color} onChange={onChange} isCenter={i == 2}/>)}
                                    </HStack>
                                </Flex>)
                            }
                            </VStack>

                            <HStack mt="3" spacing={4}>
                                <HStack>
                                    <Text fontSize="0.8rem">Transparent</Text>
                                    <Box p="1px" borderRadius={4} className="bordered" borderColor={props.color === 'transparent' ? colors[0] : 'transparent'}><Box cursor="pointer" width="20px" height="20px" bg='transparent' borderRadius="50%" className="bordered" onClick={() => onChange('transparent')}/></Box>
                                </HStack>
                                <HStack>
                                    <Text fontSize="0.8rem">Inherit</Text>
                                    <Box p="1px" borderRadius={4} className="bordered" borderColor={props.color === 'inherit' ? colors[0] : 'transparent'}><Box cursor="pointer" width="20px" height="20px" bg={useColorModeValue(customColors.textColor.light, customColors.textColor.dark)} borderRadius="50%" className="bordered" onClick={() => onChange('inherit')} /></Box>
                                </HStack>
                            </HStack>
                            
                            {presetColors.length > 0 && <HStack mt="3" spacing={4}>
                                {
                                    presetColors.map(preset => <NamedColor name={preset.label} color={preset.value} currentColor={props.color} onChange={onChange}/>)
                                }
                            </HStack>}
                            
                            <Divider mt="2" />
                            <Wrap spacing={0} mt="2">
                                        {colors1.map((c,i) => <Color  color={c} currentColor={props.color} onChange={onChange} />)}
                            </Wrap>
                            <Divider mt="2" />
                            <Wrap spacing={0} mt="2">
                                        {colors2.map((c,i) => <Color  color={c} currentColor={props.color} onChange={onChange} />)}
                            </Wrap>
                            <Divider mt="2" />
                            <Wrap spacing={0} mt="2">
                                        {colors3.map((c,i) => <Color  color={c} currentColor={props.color} onChange={onChange} />)}
                            </Wrap>
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
            </Portal>
        </Popover>
    );
};

const Color = ({ color, currentColor, onChange}) => {
    return <Box p="1px" borderRadius={4} border={`1.5px solid ${currentColor == color ?  color: 'transparent'}`}><Box cursor="pointer"  borderRadius="50%" width={"15px"} height={ "15px"} display="block" bg={color} onClick={() => onChange(color)}/></Box>
}


const Palette = ({name, color, currentColor, onChange, isCenter}) => {
    return <Box p="1px" borderRadius={4} border={`1.5px solid ${currentColor == name ?  color: 'transparent'}`}><Box cursor="pointer"  borderRadius="50%" width={isCenter ? "25px" : "17px"} height={isCenter? "25px" : "17px"} display="block" bg={color} onClick={() => onChange(name)}/></Box>
}

const NamedColor = ({name, color, currentColor, onChange}) => {
    return <HStack>
    <Text fontSize="0.8rem">{name}</Text>
    <Box p="1px" borderRadius={4} border={ `1.5px solid ${currentColor == color ? color : 'transparent'}`}><Box cursor="pointer"  borderRadius="50%" width={ "20px"} height={ "20px"} display="block" bg={color} onClick={() => onChange(color)}/></Box>
</HStack>
}