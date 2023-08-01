import React, { useState } from 'react';

import { Box, Text, HStack, Divider, VStack, Flex } from '@chakra-ui/layout';
import { useColorModeValue } from '@chakra-ui/react';
import customColors from 'theme/colors';
import { round } from 'lodash';


export interface Props {
  tooltip: any
}

export const TooltipView = ({ tooltip }: Props) => {
  return (
    <>
      <Box minWidth="150px" p="3" bg={useColorModeValue(customColors.popperBg.light, customColors.popperBg.dark)} fontSize="0.85rem">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={1}>
            <Text opacity="0.8">lon</Text>
            <Text>{round(tooltip.point.lon, 1)}</Text>
          </HStack>
          <HStack spacing={1}>
            <Text opacity="0.8">lat</Text>
            <Text>{round(tooltip.point.lat, 1)}</Text>
          </HStack>
        </Flex>
        <Divider mt="2" />
        <VStack alignItems="left" mt="2">
          {
            tooltip.data.map(v => <Flex key={v.name} justifyContent="space-between" alignItems="center" fontSize="0.85rem">
              <HStack spacing={1}>
                <Text className="color-text">{v.code}</Text>
                <Text fontSize="0.7rem">{v.name}</Text>
              </HStack>
              <Text ml="2">{v.display}</Text>
            </Flex>)
          }
        </VStack>
      </Box>
    </>
  );
};
