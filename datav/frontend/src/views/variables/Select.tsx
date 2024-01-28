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

import { HStack, Text, Tooltip } from '@chakra-ui/react'
import { TimeChangedEvent, VariableForceReload } from 'src/data/bus-events'
import { Variable, VariableQueryType, VariableRefresh } from 'types/variable'
import useBus, { dispatch } from 'use-bus'
import storage from 'utils/localStorage'
import { memo, useEffect, useState } from 'react'
import { cloneDeep, isEqual } from 'lodash'
import PopoverSelect from 'src/components/select/PopoverSelect'
import { VarialbeAllOption, VariableSplitChar } from 'src/data/variable'
import { VariableManuallyChangedKey } from 'src/data/storage-keys'
import React from 'react'
import { useStore } from '@nanostores/react'
import { variableMsg } from 'src/i18n/locales/en'
import { getUrlParams } from 'utils/url'
import { $variables } from './store'
import { parseVariableFormat } from 'utils/format'
import { getDatasource } from 'utils/datasource'
import { isEmpty } from 'utils/validate'
import { $datasources } from '../datasource/store'
import { Datasource } from 'types/datasource'
import Loading from 'components/loading/Loading'
import { EditorInputItem } from 'components/editor/EditorItem'
import { externalDatasourcePlugins } from '../dashboard/plugins/external/plugins'
import { builtinDatasourcePlugins } from '../dashboard/plugins/built-in/plugins'
import { replaceWithBuiltinVariables } from 'utils/variable'
import { setVariableValue } from './Loader'

interface Props {
  variables: Variable[]
}

const vkey = 'variables'
const VariableList = ({ variables }: Props) => {
  return (
    variables.length > 0 && (
      <HStack spacing={2}>
        {variables.map((v) => {
          return <SelectVariable key={v.id} v={v} />
        })}
      </HStack>
    )
  )
}

export default VariableList

const SelectVariable = memo(({ v }: { v: Variable }) => {
  const t1 = useStore(variableMsg)
  const values = v.values
  const [loading, setLoading] = useState(false)

  //   console.log('here333333:', cloneDeep(v), values)
  const value = isEmpty(v.selected) ? [] : v.selected.split(VariableSplitChar)
  const isDashVar = v.id.toString().startsWith('d-')
  return (
    <HStack key={v.id} spacing={1}>
      <Tooltip
        openDelay={300}
        label={(isDashVar ? t1.dashScoped : t1.globalScoped) + ': ' + v.name}
        placement='auto'
      >
        <Text fontSize='0.95em' minWidth='max-content' noOfLines={1}>
          {v.name}
        </Text>
      </Tooltip>
      {!loading &&
        v.type != VariableQueryType.TextInput &&
        !isEmpty(values) && (
          <PopoverSelect
            value={value}
            size='md'
            variant='unstyled'
            onChange={(value) => {
              const vs = value.filter((v1) => values.includes(v1))
              if (isEmpty(vs)) {
                setVariableValue(v, '')
              } else {
                setVariableValue(v, vs.join(VariableSplitChar))
              }
            }}
            options={values.map((v) => ({ value: v, label: v }))}
            exclusive={VarialbeAllOption}
            isMulti={v.enableMulti}
            showArrow={false}
            matchWidth={isDashVar}
          />
        )}
      {v.type == VariableQueryType.TextInput && (
        <EditorInputItem
          bordered={false}
          borderedBottom
          value={v.selected}
          onChange={(v1) => {
            if (v1 != v.selected) {
              setVariableValue(v, v1)
            }
          }}
          placeholder={t1.textInputTips}
        />
      )}
      {loading && <Loading size='sm' />}
    </HStack>
  )
})
