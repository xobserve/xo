// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
import React from 'react';
import copy from 'copy-to-clipboard';

import { Box,  Tooltip } from '@chakra-ui/react';
import { FaRegCopy } from 'react-icons/fa';

type PropsType = {
    copyText: string;
    placement?: any;
    tooltipTitle: string;
    fontSize?: string
};

const CopyToClipboard = ({ copyText, placement, tooltipTitle,fontSize="1rem" }: PropsType) => {
    const [hasCopied, setHasCopied] = React.useState(false);



    const handleClick = (e) => {
        e.stopPropagation();
        setHasCopied(true);
        copy(copyText);
    };

    const handleTooltipVisibilityChange = (visible: boolean) => {
        if (!visible && hasCopied) {
            setHasCopied(false)
        }
    };

        return (
            <Tooltip
                onClose={handleTooltipVisibilityChange as any}
                label={hasCopied ? 'Copied' : tooltipTitle}
                closeDelay={300}
                openDelay={300}
            >
                <Box display="inline-block" onClick={handleClick} cursor="pointer" fontSize={fontSize}>
                    <FaRegCopy />
                </Box>
            </Tooltip>
        );
}


export default CopyToClipboard;