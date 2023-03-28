import UplotReact from 'components/uPlot/UplotReact';
import React, {useMemo, useState} from 'react';
import ReactDOM, {unstable_batchedUpdates} from 'react-dom';
import * as colorManipulator from 'components/uPlot/colorManipulator';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { canvasCtx } from './_app';
import { isEmpty } from 'lodash';
import { Box } from '@chakra-ui/react';
import TimePicker from 'components/TimePicker';




const HooksApp = () => {
    return (
    <>
    <TimePicker />
    </>);
}

const UplotPage = () => {
    return (
        <Box>
            <HooksApp />
        </Box>
    )
}

export default UplotPage;
