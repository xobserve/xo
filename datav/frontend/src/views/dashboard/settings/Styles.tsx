// Copyright 2023 xobserve.io Team
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

import { Select, Switch, useMediaQuery } from '@chakra-ui/react'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { Form } from 'src/components/form/Form'
import { Dashboard } from 'types/dashboard'
import BorderSelect from 'src/components/largescreen/components/BorderSelect'
import FormItem from 'src/components/form/Item'
import React from 'react'
import { useStore } from '@nanostores/react'
import { dashboardSettingMsg } from 'src/i18n/locales/en'
import InputSelect from 'src/components/select/InputSelect'
import { isEmpty } from 'utils/validate'
import storage from 'utils/localStorage'
import { PreviousColorModeKey } from 'src/data/storage-keys'
import { MobileBreakpoint } from 'src/data/constants'
import { locale } from 'src/i18n/i18n'

interface Props {
  dashboard: Dashboard
  onChange: any
}

const bgOptions = [
  {
    label: 'None',
    value: '',
    colorMode: 'dark',
  },
  {
    label: 'Universe',
    value: '/dashboard/universe.png',
    colorMode: 'dark',
  },
  {
    label: 'Rainbow',
    value: '/dashboard/rainbow.jpg',
    colorMode: 'light',
  },
  {
    label: 'Dark Rainbow',
    value: '/dashboard/dark-rainbow.png',
    colorMode: 'dark',
  },
]

const StyleSettings = ({ dashboard, onChange }: Props) => {
  const t1 = useStore(dashboardSettingMsg)
  const lang = useStore(locale)
  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  return (
    <Form
      sx={{
        '.form-item-label': {
          width: isLargeScreen ? '200px' : '100px',
        },
      }}
      spacing={1}
    >
      <FormItem
        size='md'
        title={t1.background}
        desc={t1.backgroundTips}
        labelWidth='100%'
      >
        {/* url(/dashboard-bg.png) */}
        <InputSelect
          width={isLargeScreen ? '500px' : '100%'}
          size='md'
          value={dashboard.data.styles.bg.url}
          onChange={(v) => {
            onChange((draft) => {
              draft.data.styles.bg = {
                url: v.trim(),
                colorMode:
                  bgOptions.find((item) => item.value === v.trim())
                    ?.colorMode ?? 'dark',
              }
            })
            storage.remove(PreviousColorModeKey)
          }}
          options={bgOptions as any}
        />
      </FormItem>
      {!isEmpty(dashboard.data.styles.bg.url) && (
        <FormItem title={t1.backgroundColorMode}>
          <Select
            value={dashboard.data.styles.bg.colorMode}
            onChange={(e) => {
              const v = e.currentTarget.value
              onChange((draft) => {
                draft.data.styles.bg.colorMode = v
              })
              storage.remove(PreviousColorModeKey)
            }}
            isDisabled={
              !isEmpty(
                bgOptions.find(
                  (item) => item.value === dashboard.data.styles.bg.url,
                ),
              )
            }
          >
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
          </Select>
        </FormItem>
      )}
      <FormItem size='md' title={t1.backgroundColor} labelWidth='100%'>
        <EditorInputItem
          type='input'
          value={dashboard.data.styles.bgColor}
          onChange={(v) => {
            onChange((draft) => {
              draft.data.styles.bgColor = v
            })
          }}
          placeholder='try rgb(15,23,42) for dark mode'
        />
      </FormItem>
      <FormItem title={t1.enableBg} desc={t1.enableBgTips} alignItems='center'>
        <Switch
          defaultChecked={dashboard.data.styles?.bgEnabled}
          onChange={(e) =>
            onChange((draft) => {
              draft.data.styles.bgEnabled = e.currentTarget.checked
            })
          }
        />
      </FormItem>
      <FormItem
        title={t1.dashBorder}
        desc={t1.dashBorderTips}
        alignItems='center'
      >
        <BorderSelect
          value={dashboard.data.styles?.border}
          onChange={(v) => {
            onChange((draft) => {
              draft.data.styles.border = v
            })
          }}
        />
      </FormItem>

      {/* <PanelAccordion title="Decoration" defaultOpen>
                <PanelEditItem title="type">
                    <Select size="sm" value={dashboard.data.styles?.decoration.type} onChange={e => {
                        const v = e.currentTarget.value
                        onChange(dashboard => {
                            dashboard.data.styles.decoration.type = v
                        })
                    }}>
                        {
                            Object.keys(PanelDecorationType).map(key => <option value={PanelDecorationType[key]}>{key}</option>)
                        }
                    </Select>
                </PanelEditItem>
                <PanelEditItem title="reverse" desc="only a few decorations support reverse mode">
                    <Switch defaultChecked={dashboard.data.styles.decoration.reverse} onChange={e => {
                        const checked = e.currentTarget.checked
                        onChange(dashboard => {
                            dashboard.data.styles.decoration.reverse = checked
                        })
                    }}/>
                </PanelEditItem>
                <PanelEditItem title="width">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.width} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="height">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.height} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.height = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="top">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.top} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.top = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="left">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.left} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.left = v
                    })} />
                </PanelEditItem>
            </PanelAccordion> */}
    </Form>
  )
}

export default StyleSettings
