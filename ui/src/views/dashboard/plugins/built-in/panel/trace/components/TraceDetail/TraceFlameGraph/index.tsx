// Copyright (c) 2022 The Jaeger Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import React, { memo } from 'react';
import { FlamegraphRenderer, convertJaegerTraceToProfile } from '@pyroscope/flamegraph';
import { Trace } from 'types/plugins/trace';
import { Box, useColorMode } from '@chakra-ui/react';
import { cloneDeep } from 'lodash';
import '@pyroscope/flamegraph/dist/index.css';

interface Props {
    trace: Trace
}
const TraceFlamegraph = memo(({ trace }: Props) => {
    const convertedProfile = convertJaegerTraceToProfile(cloneDeep(trace))
    const { colorMode } = useColorMode()
    return (
        <Box className="Flamegraph-wrapper" padding='2px calc(1rem - 5px)' sx={{
            'input[type=search]': {
                background: 'transparent',
                color: colorMode === 'light' ? 'black' : '#fff !important',
            },
            '.rc-menu-button': {
                background: 'transparent'
            },
            // "button[disabled]": {
            //     backgroundColor:  colorMode == "light" ?  customColors.bodyBg.light : customColors.bodyBg.dark,
            // }
        }}>
            <FlamegraphRenderer colorMode={colorMode} profile={convertedProfile} />
        </Box>
    );
});

export default TraceFlamegraph;
