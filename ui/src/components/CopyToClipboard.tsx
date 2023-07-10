// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
import * as React from 'react';
import copy from 'copy-to-clipboard';

import { Box,  Tooltip } from '@chakra-ui/react';
import IconButton from './button/IconButton';
import { FaCopy } from 'react-icons/fa';

type PropsType = {
    copyText: string;
    placement?: any;
    tooltipTitle: string;
};

const CopyToClipboard = ({ copyText, placement, tooltipTitle }: PropsType) => {
    const [hasCopied, setHasCopied] = React.useState(false);



    const handleClick = () => {
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
            >
                <Box display="inline-block">
                    <IconButton
                        onClick={handleClick}
                        variant="ghost"
                        color="inherit"
                    ><FaCopy /></IconButton>
                </Box>
            </Tooltip>
        );
}


export default CopyToClipboard;