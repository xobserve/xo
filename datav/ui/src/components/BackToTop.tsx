// Copyright 2023 observex.io Team
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

import React from 'react'
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTop = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (<>
        {scrollPosition > 1500 && (<a href='#top'>
            <Box position='fixed'
                bottom='20px'
                right={['16px', '50px']}
                zIndex={1}
            >
                <Box  aria-label="go to github"
                    layerStyle="textSecondary"
                    _focus={{ border: null }}
                    fontWeight="300"
                    width="1.8rem"
                    onClick={() => location.href = "#comments"}><FaArrowUp /></Box>
            </Box>
        </a>)}
    </>)
}

export default BackToTop