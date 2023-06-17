import React, { useEffect, useLayoutEffect, useRef } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, useColorMode } from '@chakra-ui/react';
import { ColorModeSwitcher } from 'components/ColorModeSwitcher';
import ReactDiffViewer from 'react-diff-viewer';
import { isEmpty } from 'lodash';


// just for test purpose
export default function () {
  const a = null 
  console.log(isEmpty(null))
  return <>
  </>;
}
