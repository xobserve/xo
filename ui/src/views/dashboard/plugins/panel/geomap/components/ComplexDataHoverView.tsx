import React, { useState } from 'react';

import { GeomapLayerHover } from './types';
import { Box } from '@chakra-ui/layout';


export interface Props {
  layers?: GeomapLayerHover[];
  isOpen: boolean;
  onClose: () => void;
}

export const ComplexDataHoverView = ({ layers, onClose, isOpen }: Props) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  if (!layers) {
    return null;
  }

  return (
    <>
      {isOpen && <Box>aaaa</Box>}
    </>
  );
};
