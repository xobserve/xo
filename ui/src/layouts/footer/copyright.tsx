import React from "react"
import { Box, Icon, Text, Stack, Link, chakra, Center } from "@chakra-ui/react"
import { IoLogoTwitter, IoLogoLinkedin } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import { DiGithubBadge } from "react-icons/di"

import { requestApi } from "utils/axios/request"
import useSession from "hooks/use-session"

type FooterLinkProps = {
    icon?: React.ElementType
    href?: string
    label?: string
}

const FooterLink: React.FC<FooterLinkProps> = ({ icon, href, label }) => (
    <Link display="inline-block" href={href} aria-label={label} isExternal>
        <Icon as={icon} fontSize="xl" color="gray.400" />
    </Link>
)

const links = [
    {
        icon: DiGithubBadge,
        label: "GitHub",
        href: "https://github.com/rustlang-cn",
    },
    {
        icon: MdEmail,
        label: "Email",
        href: "mailto:cto@188.com",
    },
]


const FooterCopyright = () => {
    return (
        <>
            <Box position="absolute" left="0" right="0" bottom="0">
                <Box as="footer" mt={12} textAlign="center">
                    <Text fontSize="sm" display="flex" alignItems="center" justifyContent="center">
                        <span>Proudly made in </span>
                        <chakra.span fontSize="1.5rem" ml="2">🇨🇳</chakra.span>
                        <chakra.span ml="2">by RustCn</chakra.span>
                    </Text>
                    {/* <Stack mt={4} direction="row" spacing="12px" justify="center">
                {links.map((link) => (
                    <FooterLink key={link.href} {...link} />
                ))}
            </Stack> */}
                </Box>
            </Box>
        </>
    )
}

export default FooterCopyright
