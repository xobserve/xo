import React, { useEffect, useLayoutEffect, useRef } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, useColorMode } from '@chakra-ui/react';
import { ColorModeSwitcher } from 'components/ColorModeSwitcher';
import ReactDiffViewer from 'react-diff-viewer';
import { isEmpty } from 'lodash';
import DecorationSelect from 'components/largescreen/components/DecorationSelect';
import { PanelDecorationType, PanelTitleDecorationType } from 'types/panel/styles';
import BorderSelect from 'components/largescreen/components/BorderSelect';


// just for test purpose
export default function () {
  const a = null 
  console.log(isEmpty(null))
  return <> 
  <BorderSelect value="None"  />
  </>;
}
