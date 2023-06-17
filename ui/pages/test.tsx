import React, { useEffect, useLayoutEffect, useRef } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, useColorMode } from '@chakra-ui/react';
import { ColorModeSwitcher } from 'components/ColorModeSwitcher';
import ReactDiffViewer from 'react-diff-viewer';


// just for test purpose
export default function () {
  const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;
const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;
 
  return <>
     <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
  </>;
}
