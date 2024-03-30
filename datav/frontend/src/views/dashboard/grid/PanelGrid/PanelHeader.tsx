import { Box, Center, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Tag, Text, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react"
import { Dropdown, MenuProps } from "antd"
import TitleDecoration from "components/largescreen/components/TitleDecoration"
import { MarkdownRender } from "components/markdown/MarkdownRender"
import useEmbed from "hooks/useEmbed"
import { clone, cloneDeep, toString } from "lodash"
import React, { useState } from "react"
import { FaBug, FaEdit, FaEllipsisV, FaExternalLinkAlt, FaLayerGroup, FaRegClock, FaRegClone, FaRegCopy, FaRegEye, FaTrashAlt } from "react-icons/fa"
import { useSearchParam } from "react-use"
import { PANEL_HEADER_HEIGHT } from "src/data/constants"
import { commonMsg, panelMsg, templateMsg } from "src/i18n/locales/en"
import { Dashboard, Panel } from "types/dashboard"
import { Variable } from "types/variable"
import { paletteColorNameToHex } from "utils/colors"
import { extractPanelTemplateContent } from "utils/template"
import { addParamToUrl } from "utils/url"
import { isEmpty } from "utils/validate"
import { replaceWithVariables } from "utils/variable"
import PanelDatePicker from "../../components/PanelDatePicker"
import { dispatch } from "use-bus"
import { PanelForceRequeryEvent, UpdatePanelEvent } from "src/data/bus-events"
import DebugPanel from "./DebugPanel"
import TemplateExport from "src/views/template/TemplateExport"
import VariablesLoader from 'src/views/variables/Loader'
import PanelDecoration from 'src/components/largescreen/components/Decoration'
import { TemplateType } from "types/template"


interface PanelHeaderProps {
    dashboard: Dashboard
    queryError: string
    panel: Panel
    onCopyPanel: (panel: Panel, type: string) => void
    onRemovePanel: (panel: Panel) => void
    onHidePanel: (panel: Panel) => void
    data: any[]
    loading: boolean
    onHover: boolean
    pvariables: Variable[]
}
const PanelHeader = ({
    dashboard,
    queryError,
    panel,
    onCopyPanel,
    onRemovePanel,
    onHidePanel,
    data,
    loading,
    onHover,
    pvariables,
}: PanelHeaderProps) => {
    const viewPanel = useSearchParam('viewPanel')
    const t = commonMsg.get()
    const t1 = panelMsg.get()
    const t2 = templateMsg.get()

    const title = replaceWithVariables(panel.title, null, pvariables)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [templatePanel, setTemplatePanel] = useState<Partial<Panel>>(null)

    const { colorMode } = useColorMode()
    const embed = useEmbed()
    const readonly = useSearchParam('readonly')
    const menuItems: MenuProps['items'] = [
        {
            key: 'edit',
            icon: <FaEdit />,
            label: t.edit,
            onClick: () => {
                if (panel.isSubPanel) {
                    addParamToUrl({ editSub: panel.id })
                } else {
                    addParamToUrl({ edit: panel.id })
                }
            },
        },
        {
            key: 'copy',
            icon: <FaRegCopy />,
            label: t.copy,
            onClick: () => onCopyPanel(panel, 'copy'),
        },
        {
            key: 'clone',
            icon: <FaRegClone />,
            label: t.clone,
            onClick: () => onCopyPanel(panel, 'clone'),
        },
        {
            type: 'divider',
        },
        {
            key: 'debug',
            icon: <FaBug />,
            label: t1.debugPanel,
            onClick: onOpen,
        },
        {
            key: 'view',
            icon: <FaRegEye />,
            label: viewPanel ? t1.exitlView : t1.viewPanel,
            onClick: () => addParamToUrl({ viewPanel: viewPanel ? null : panel.id }),
        },
        !viewPanel && {
            key: 'more',
            label: t.more,
            icon: <FaLayerGroup style={{ display: 'inline-block' }} />,
            children: [
                {
                    key: 'hidden',
                    label: t1.hidePanel,
                    // icon: <FaRegEyeSlash />,
                    onClick: () => onHidePanel(panel),
                },
                {
                    key: 'exportTemplate',
                    label: t2.exportTemplate,
                    onClick: () =>
                        setTemplatePanel(extractPanelTemplateContent(clone(panel))),
                },
                {
                    key: 'requery',
                    label: t1.reQeuryData,
                    onClick: () => dispatch(PanelForceRequeryEvent + panel.id),
                },
            ],
        },
        !viewPanel && {
            type: 'divider',
        },
        !viewPanel && {
            key: 'remove',
            label: t.remove,
            icon: <FaTrashAlt />,
            onClick: () => onRemovePanel(panel),
        },
    ]
    return (
        <Box>
            <HStack
                className='grid-drag-handle'
                height={`${PANEL_HEADER_HEIGHT - (isEmpty(title) ? 0 : 0)}px`}
                cursor='move'
                spacing='0'
                position={isEmpty(title) ? 'absolute' : 'relative'}
                width='100%'
                zIndex={panel.isSubPanel ? 1000 : 1001}
            >
                <Flex
                    width='100%'
                    justifyContent='space-between'
                    alignItems='center'
                    pl='2'
                >
                    {panel.styles.title.position != 'left' && <Box></Box>}
                    {!(isEmpty(title) && isEmpty(queryError)) ? (
                        <HStack
                            paddingTop={panel.styles.title.paddingTop}
                            paddingBottom={panel.styles.title.paddingBottom}
                            paddingLeft={panel.styles.title.paddingLeft}
                            paddingRight={panel.styles.title.paddingRight}
                            fontSize={panel.styles.title.fontSize}
                            fontWeight={panel.styles.title.fontWeight}
                            spacing={1}
                            zIndex={1}
                            alignItems='center'
                        >
                            <Box
                                color={paletteColorNameToHex(
                                    panel.styles.title.color,
                                    colorMode,
                                )}
                            >
                                <TitleDecoration styles={panel.styles}>
                                    <Text noOfLines={1}>{title}</Text>
                                </TitleDecoration>
                            </Box>
                            {(queryError || panel.desc) && (
                                <Tooltip
                                    label={
                                        isEmpty(toString(queryError))
                                            ? <MarkdownRender md={replaceWithVariables(panel.desc, {})} enableToc />
                                            : toString(queryError)
                                    }
                                >
                                    <Tag
                                        variant='subtle'
                                        size='sm'
                                        colorScheme={queryError ? 'red' : null}
                                        paddingInlineStart='6px'
                                        paddingInlineEnd='6px'
                                        minW='auto'
                                        minH='14px'
                                        borderRadius={1}
                                    >
                                        i
                                    </Tag>
                                </Tooltip>
                            )}
                        </HStack>
                    ) : (
                        <Box width='100px'>&nbsp;</Box>
                    )}
                    {readonly != 'on' && !panel.disableMenu && !panel.isSubPanel && (
                        <PanelMenu
                            panel={panel}
                            menuItems={menuItems}
                            onHover={onHover}
                            embed={embed}
                            colorMode={colorMode}
                        />
                    )}
                </Flex>
                {!loading && panel.enableScopeTime && (
                    <Popover trigger='hover'>
                        <PopoverTrigger>
                            <Box
                                opacity='0.5'
                                fontSize='0.8rem'
                                zIndex={1000}
                                cursor='pointer'
                                padding={1}
                            >
                                <FaRegClock />
                            </Box>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverBody>
                                <PanelDatePicker
                                    id={panel.id.toString()}
                                    timeRange={panel.scopeTime}
                                    onChange={(tr) => {
                                        panel.scopeTime = tr
                                        dispatch({
                                            type: UpdatePanelEvent,
                                            data: cloneDeep(panel),
                                        })
                                    }}
                                    showIcon
                                />
                                <Text opacity={0.7} mt='2' ml='3' fontSize='0.9rem'>
                                    Panel time range
                                </Text>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                )}
                {!isEmpty(panel.externalLinks) && (
                    <Dropdown
                        placement='bottom'
                        menu={{
                            mode: 'inline',
                            items: panel.externalLinks.map((link, i) => {
                                return {
                                    key: link.url,
                                    label: link.title,
                                    onClick: () => {
                                        window.open(link.url, link.targetBlank ? '_blank' : '_self')
                                    },
                                }
                            }),
                        }}
                        trigger={['hover']}
                        overlayStyle={{}}
                    >
                        <Box
                            padding={1}
                            opacity='0.6'
                            fontSize='0.8rem'
                            zIndex={1000}
                            cursor='pointer'
                        >
                            <FaExternalLinkAlt />
                        </Box>
                        {/* </Center> */}
                    </Dropdown>
                )}
                {/* <Box display="none"><FaBook className="grid-drag-handle" /></Box> */}
            </HStack>
            <PanelDecoration decoration={panel.styles.decoration} />
            {isOpen && (
                <DebugPanel
                    dashboard={dashboard}
                    panel={panel}
                    isOpen={isOpen}
                    onClose={onClose}
                    data={data}
                />
            )}

            <TemplateExport
                type={TemplateType.Panel}
                data={templatePanel}
                onClose={() => setTemplatePanel(null)}
            />
            {readonly != 'on' && !panel.disableMenu && panel.isSubPanel && (
                <Box position='absolute' zIndex={1002}>
                    <PanelMenu
                        panel={panel}
                        menuItems={menuItems}
                        onHover={onHover}
                        embed={embed}
                        colorMode={colorMode}
                    />
                </Box>
            )}
            <Center>
                <Flex
                    flexWrap='wrap'
                    alignItems='center'
                    columnGap={3}
                    rowGap={0}
                    zIndex={1500}
                >
                    {!isEmpty(pvariables) && <VariablesLoader variables={pvariables} />}
                </Flex>
            </Center>
        </Box>
    )
}

export default PanelHeader


const PanelMenu = ({ panel, menuItems, onHover, embed, colorMode }) => {
    return (
        <Dropdown
            placement='bottom'
            menu={{
                mode: 'inline',
                items: menuItems,
            }}
            trigger={['hover']}
            overlayStyle={{}}
        >
            <Box
                padding={1}
                opacity={onHover ? 0.6 : 0}
                fontSize='0.8rem'
                zIndex={1000}
                cursor='pointer'
                transition='opacity 0.3s'
            >
                <FaEllipsisV />
            </Box>
        </Dropdown>
    )
}