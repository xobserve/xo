import React from "react";
import { SketchPicker } from "react-color";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Button,
    Center,
} from "@chakra-ui/react";

export const ColorPicker = (props) => {
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
