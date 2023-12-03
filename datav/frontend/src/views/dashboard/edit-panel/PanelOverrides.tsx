// Copyright 2023 xObserve.io Team

import {
  Box,
  Button,
  StackDivider,
  Select as ChakraSelect,
  VStack,
  useMediaQuery,
} from '@chakra-ui/react'
import { Form, FormSection } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import { useMemo } from 'react'
import { FaTimes } from 'react-icons/fa'
import { Panel, PanelEditorProps } from 'types/dashboard'
import React from 'react'
import { useStore } from '@nanostores/react'
import { panelMsg } from 'src/i18n/locales/en'
import { getPanelOverridesRules } from 'utils/dashboard/panel'
import { Select } from 'antd'
import { dispatch } from 'use-bus'
import { PanelForceRebuildEvent } from 'src/data/bus-events'
import { MobileBreakpoint } from 'src/data/constants'
import { externalPanelPlugins } from '../plugins/external/plugins'
import { builtinPanelPlugins } from '../plugins/built-in/plugins'

const PanelOverrides = ({ panel, onChange, data }: PanelEditorProps) => {
  const t1 = useStore(panelMsg)

  const overrides = panel.overrides
  const names: { label: string; value: string }[] = useMemo(() => {
    const p =
      builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
    if (p && p.getOverrideTargets) {
      const d = p.getOverrideTargets(panel, data)
      return d ?? []
    }

    return []
  }, [data])

  const allRules = getPanelOverridesRules(panel.type, externalPanelPlugins)

  const onAddOverride = () => {
    const o = {
      target: names[0].value,
      overrides: [],
    }
    onChange((panel: Panel) => {
      panel.overrides.push(o)
    })
  }

  const onAddRule = (i) => {
    onChange((tempPanel: Panel) => {
      const r = allRules.find(
        (r0) => !panel.overrides[i].overrides.some((o) => o.type == r0),
      )
      tempPanel.overrides[i].overrides.push({
        type: r,
        value: null,
      })
    })
  }

  const removeOverride = (i) => {
    onChange((panel: Panel) => {
      panel.overrides.splice(i, 1)
    })
  }

  const removeRule = (i, j) => {
    onChange((panel: Panel) => {
      panel.overrides[i].overrides.splice(j, 1)
    })

    dispatch(PanelForceRebuildEvent + panel.id)
  }

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

  const plugin =
    builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
  const PluginOverrideEditor = plugin && plugin.overrideEditor

  return (
    <Form p='2'>
      {overrides.map((o, i) => (
        <FormSection
          key={o.target + i}
          title={t1.overrides + (i + 1)}
          p='1'
          titleSize='0.9rem'
          position='relative'
          bordered
        >
          <Box
            position='absolute'
            right='2'
            top='9px'
            cursor='pointer'
            onClick={() => removeOverride(i)}
          >
            <FaTimes fontSize='0.8rem' />
          </Box>
          <FormItem title={t1.targetName} alignItems='center'>
            <Select
              style={{ minWidth: isLargeScreen ? '150px' : '100px' }}
              showSearch
              size='large'
              value={o.target}
              onChange={(v) => {
                onChange((panel: Panel) => {
                  const o = panel.overrides[i]
                  o.target = v
                })
              }}
              options={names.map((name, i) => ({
                value: name.value,
                label: name.label,
              }))}
              popupMatchSelectWidth={false}
            />
          </FormItem>

          <VStack
            alignItems='left'
            pl='6'
            divider={<StackDivider />}
            spacing={3}
          >
            {o.overrides.length > 0 &&
              o.overrides.map((rule, j) => (
                <FormSection
                  key={rule.type + j}
                  title={`Rule ${j + 1}`}
                  width='fit-content'
                  titleSize='0.9rem'
                  position='relative'
                >
                  <FormItem title='type' size='sm'>
                    <ChakraSelect
                      size='sm'
                      value={rule.type}
                      onChange={(e) => {
                        const v = e.currentTarget.value
                        onChange((panel: Panel) => {
                          panel.overrides[i].overrides[j].type = v
                          panel.overrides[i].overrides[j].value = null
                        })
                      }}
                    >
                      {allRules.map((r) => {
                        return (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        )
                      })}
                    </ChakraSelect>
                  </FormItem>
                  {PluginOverrideEditor && (
                    <PluginOverrideEditor
                      override={rule}
                      onChange={(v) => {
                        onChange((panel: Panel) => {
                          panel.overrides[i].overrides[j].value = v
                        })
                      }}
                    />
                  )}
                  <Box
                    position='absolute'
                    right='1'
                    top='5px'
                    cursor='pointer'
                    onClick={() => removeRule(i, j)}
                  >
                    <FaTimes fontSize='0.8rem' />
                  </Box>
                </FormSection>
              ))}
          </VStack>

          <Button size='sm' variant='ghost' onClick={() => onAddRule(i)}>
            {t1.addRule}
          </Button>
        </FormSection>
      ))}
      {allRules.length > 0 && (
        <Button width='100%' variant='outline' onClick={onAddOverride}>
          {t1.addOverride}
        </Button>
      )}
    </Form>
  )
}

export default PanelOverrides
