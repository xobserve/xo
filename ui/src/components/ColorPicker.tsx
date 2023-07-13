import React from "react";
import { SketchPicker } from "react-color";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Center,
} from "@chakra-ui/react";
import { PresetColor } from "react-color/lib/components/sketch/Sketch";

interface Props {
    presetColors?: PresetColor[]
    color: string
    onChange: any
    children: any
}

export const ColorPicker = (props:Props) => {
    return (
        <Popover>
            <PopoverTrigger>{props.children}</PopoverTrigger>
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
