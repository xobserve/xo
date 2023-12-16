import { Flex, HStack, Text, Button, Tag, useColorMode } from '@chakra-ui/react'
import { Tooltip } from 'antd'
import { MarkdownRender } from 'components/markdown/MarkdownRender'
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { locale } from 'src/i18n/i18n'
import { commonMsg } from 'src/i18n/locales/en'
import { Template, TemplateScope } from 'types/template'

interface Props {
  template: Template
  width: any
  height?: number
  onEdit?: () => void
  selected: boolean
}

const TemplateCard = ({
  template,
  width,
  height = 300,
  onEdit = null,
  selected,
}: Props) => {
  const lang = locale.get()
  const t = commonMsg.get()
  const { colorMode } = useColorMode()
  const [onHover, setOnHover] = useState(false)
  let scope = lang == 'zh' ? '全部' : 'All'
  let scopeTips =
    lang == 'zh'
      ? '该模版是公共模版，对全部租户都可见'
      : 'This template is public and visible to all tenants'
  if (template.scope == TemplateScope.Tenant) {
    scope = lang == 'zh' ? '租户' : 'Tenant'
    scopeTips =
      lang == 'zh'
        ? '该模版由当前租户创建，仅对当前租户可见'
        : 'This template is created by current tenant and only visible to current tenant'
  } else if (template.scope == TemplateScope.Team) {
    scope = lang == 'zh' ? '团队' : 'Team'
    scopeTips =
      lang == 'zh'
        ? '该模版由当前团队模版，仅对当前团队可见'
        : 'This template is created by current team and only visible to current team'
  }

  return (
    <Flex
      className={`${colorMode == 'dark' ? '' : 'bordered'} panel-bg ${
        selected && 'highlight-bordered'
      }`}
      width={width}
      flexDirection='column'
      height={height}
      py='2'
      px='4'
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
      position='relative'
    >
      <HStack>
        <Text fontWeight={500} fontSize='1.1rem'>
          {template.title}
        </Text>
        <Tooltip title={scopeTips}>
          <Tag size='md' variant='subtle'>
            {scope}
          </Tag>
        </Tooltip>
      </HStack>
      <MarkdownRender
        md={template.description}
        fontSize='0.9rem'
        maxH={height - 50}
        width='100%'
        mt='4'
      />
      <HStack
        position='absolute'
        right='2'
        top='6px'
        opacity={onHover ? 0.6 : 0}
        spacing={3}
        transition='opacity 0.4s'
      >
        <Tooltip
          title={
            lang == 'zh' ? '使用该模版来创建' : 'Use this template to create'
          }
        >
          <Button size='xs'>{t.use.toUpperCase()}</Button>
        </Tooltip>
        <Tooltip
          title={lang == 'zh' ? '更新模版内容' : 'Update template content'}
        >
          <FaPlus cursor='pointer' />
        </Tooltip>
        {onEdit && (
          <Tooltip title={lang == 'zh' ? '编辑模版' : 'Edit template'}>
            <MdEdit cursor='pointer' onClick={onEdit} />
          </Tooltip>
        )}
      </HStack>
    </Flex>
  )
}

export default TemplateCard
