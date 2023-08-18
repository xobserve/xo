import { Box, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from "@chakra-ui/react";
import React from "react"
import { FaEdit, FaTrash, FaTrashAlt } from "react-icons/fa";
import { Annotation } from "types/annotation";
import { requestApi } from "utils/axios/request";
import { durationToSeconds } from "utils/date";
import { dateTimeFormat } from "utils/datetime/formatter";
import { $dashAnnotations } from "../dashboard/store/annotation";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";
import ColorTag from "components/ColorTag";

interface Props {
    annotation: Annotation
    width: number
    onEditAnnotation: any
    onRemoveAnnotation: any
}
const MIN_REGION_ANNOTATION_WIDTH = 6;
const AnnotationMarker = ({ annotation, width,onEditAnnotation, onRemoveAnnotation }: Props) => {
    const isRegionAnnotation = width > MIN_REGION_ANNOTATION_WIDTH;
    let left = `${width / 2}px`;
    // console.log("here3333333:",annotation,width)
    


    return (
        <Popover trigger="hover" openDelay={10}>
            <PopoverTrigger>
                <Box cursor="pointer" className="annotation-marker">
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
                </Box>
            </PopoverTrigger>
            {/* <Portal> */}
            <PopoverContent minWidth="350px" p="0"> 
                <PopoverArrow />
                <PopoverBody p="0">
                    <Flex justifyContent="space-between" alignItems="center" fontSize="0.8rem" className="bordered-bottom" px="1">
                        <HStack spacing={3}>
                            <VStack alignItems="left" spacing={1} className="bordered-right" px="2" py="1">
                                <HStack>
                                    <Text minWidth="fit-content">{dateTimeFormat(annotation.time * 1000)}</Text>
                                </HStack>
                                <HStack>
                                    <Text minWidth="fit-content">{dateTimeFormat((annotation.time + durationToSeconds(annotation.duration)) * 1000)}</Text>
                                </HStack>
                            </VStack>
                            <Text className="color-text" fontWeight={550}>{annotation.duration}</Text>

                        </HStack>
                        <HStack spacing={3} className="action-icon">
                            <FaEdit cursor="pointer" onClick={onEditAnnotation}/>
                            <FaTrashAlt cursor="pointer" onClick={onRemoveAnnotation}/>
                        </HStack>
                    </Flex>
                    <Text fontSize="0.9rem" px="4" py="1">{annotation.text}</Text>
                    <HStack width="100%" px="3" py="1" spacing={1}>
                                {
                                    annotation.tags.map(t => <ColorTag  name={t}  />)
                                }

                            </HStack>
                </PopoverBody>
            </PopoverContent>
            {/* </Portal> */}
        </Popover>
    )
}

export default AnnotationMarker