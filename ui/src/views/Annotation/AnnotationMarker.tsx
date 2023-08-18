import { Flex, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text } from "@chakra-ui/react";
import React from "react"
import { Annotation } from "types/annotation";
import { dateTimeFormat } from "utils/datetime/formatter";

interface Props {
    annotation: Annotation
    width: number
}
const MIN_REGION_ANNOTATION_WIDTH = 6;
const AnnotationMarker = ({ annotation, width }: Props) => {
    const isRegionAnnotation = width > MIN_REGION_ANNOTATION_WIDTH;
    let left = `${width / 2}px`;
    // console.log("here3333333:",annotation,width)
    return (
        <Popover trigger="hover" openDelay={0}>
            <PopoverTrigger>
                <div>
                    {
                        !isRegionAnnotation ? <div
                            style={{
                                left,
                                position: 'relative',
                                transform: 'translate3d(-50%,-50%, 0)',
                                width: 0,
                                height: 0,
                                borderLeft: '4px solid transparent',
                                borderRight: '4px solid transparent',
                                borderBottom: '4px solid rgba(0, 211, 255, 1)'
                            }}
                        /> : <div
                            style={{
                                width: `${width}px`,
                                height: '5px',
                                transform: 'translate3d(0%,-50%, 0)',
                                // borderLeft: '4px solid transparent',
                                // borderRight: '4px solid transparent',
                                background: 'rgba(0, 211, 255, 1)'
                            }}
                        />

                    }
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Text>{dateTimeFormat(annotation.time)}</Text>
                    </Flex>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}

export default AnnotationMarker