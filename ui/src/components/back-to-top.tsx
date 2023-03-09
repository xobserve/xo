import { Box, Image } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SvgButton from "./icons/SvgButton";

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
                <SvgButton
                    aria-label="go to github"
                    layerStyle="textSecondary"
                    _focus={{ border: null }}
                    fontWeight="300"
                    icon="top"
                    width="1.8rem"
                    onClick={() => location.href = "#comments"}
                />
            </Box>
        </a>)}
    </>)
}

export default BackToTop