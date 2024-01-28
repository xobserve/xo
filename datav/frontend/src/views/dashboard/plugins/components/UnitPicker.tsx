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

import {
  Button,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  VStack,
} from '@chakra-ui/react'
import { cloneDeep, isNumber, round } from 'lodash'
import { useState } from 'react'
import { FaArrowUp, FaMinus, FaPlus } from 'react-icons/fa'
import { Unit, Units } from 'types/panel/plugins'
import React from 'react'
import { commonMsg } from 'src/i18n/locales/en'
import { useStore } from '@nanostores/react'
import { getInitUnits } from 'src/data/panel/initPlugins'
import { isEmpty } from 'utils/validate'
import { VariableCurrentValue } from 'src/data/variable'
import { replaceWithVariables } from 'utils/variable'
import { EditorInputItem } from '../../../../components/editor/EditorItem'
import { init } from 'echarts'

interface Props {
  value: Units
  onChange: any
  size?: 'sm' | 'md' | 'lg'
}

export const UnitPicker = ({ value, onChange, size = 'md' }: Props) => {
  const t = useStore(commonMsg)
  const [units, setUnits] = useState<Units>(value)
  if (isEmpty(units)) {
    setUnits(getInitUnits())
    return
  }

  const onAddUnit = () => {
    units.units.push({
      operator: units.units[0]?.operator ?? 'x',
      rhs: 1,
      unit: '',
    })
    setUnits(cloneDeep(units))
  }

  const onRemoveUnit = (i) => {
    units.units.splice(i, 1)
    setUnits(cloneDeep(units))
  }

  const onLiftUnit = (i) => {
    ;[units.units[i - 1], units.units[i]] = [units.units[i], units.units[i - 1]]

    setUnits(cloneDeep(units))
  }

  const onChangeUnitType = (t) => {
    switch (t) {
      case 'none':
        setUnits({
          unitsType: t,
          units: [],
        })
        break
      case 'short':
        setUnits({
          unitsType: t,
          units: initShortUnits(),
        })
        break
      case 'percent':
        setUnits({
          unitsType: t,
          units: initPercentUnits(),
        })
        break
      case 'percent%':
        setUnits({
          unitsType: t,
          units: [
            {
              operator: 'x',
              rhs: 1,
              unit: '%',
            },
          ],
        })
        break
      case 'time':
        setUnits({
          unitsType: t,
          units: initTimeUnits(),
        })
        break
      case 'bytes':
        setUnits({
          unitsType: t,
          units: initBytesUnits(),
        })
        break
      case 'format':
        setUnits({
          unitsType: t,
          units: [
            {
              operator: 'x',
              rhs: 0,
              unit: `$\{${VariableCurrentValue}\}`,
            },
          ],
        })
        break
      case 'enum':
        setUnits({
          unitsType: t,
          units: [
            {
              operator: '=',
              rhs: 0,
              unit: `Down`,
            },
            {
              operator: '=',
              rhs: 1,
              unit: `Up`,
            },
          ],
        })
        break
      case 'custom':
        if (units.unitsType != 'enum') {
          setUnits({
            unitsType: t,
            units: units.units,
          })
        } else {
          setUnits({
            unitsType: t,
            units: [],
          })
        }
        break
      default:
        setUnits({
          unitsType: t,
          units: [],
        })
        break
    }
  }

  const onSubmit = () => {
    // checking whether rhs of first unit is 1, because the fist unit has to be the base unit
    // if (units.length > 0 && units[0].rhs != 1) {
    //     toast({
    //         description: "rhs of first unit must be set to 1, because the fist unit is base unit",
    //         status: "warning",
    //         duration: 5000,
    //         isClosable: true,
    //     });
    //     return
    // }
    onChange(units)
  }
  return (
    <>
      <HStack>
        <Select
          size={size}
          value={units.unitsType}
          onChange={(e) => onChangeUnitType(e.currentTarget.value)}
        >
          <option value='none'>None</option>
          <option value='short'>Short</option>
          <option value='percent'>Percent: 1 -&gt; 100%</option>
          <option value='percent%'>Percent: 1 -&gt; 1%</option>
          <option value='time'>Time: ms/s/m/.../day</option>
          <option value='bytes'>Bytes: b/KB/MB/GB</option>
          <option value='format'>String format</option>
          <option value='enum'>Enum</option>
          <option value='custom'>Custom units</option>
        </Select>
        {(units.unitsType == 'custom' || units.unitsType == 'enum') && (
          <FaPlus
            cursor='pointer'
            onClick={onAddUnit}
            opacity='0.8'
            fontSize='0.8rem'
          />
        )}
      </HStack>
      <VStack alignItems='left' mt='2'>
        {units.units?.map((unit, i) => {
          return (
            <HStack>
              <Button
                isDisabled={
                  units.unitsType == 'format' || units.unitsType == 'enum'
                }
                size='sm'
                onClick={() => {
                  unit.operator = unit.operator == 'x' ? '/' : 'x'
                  setUnits(cloneDeep(units))
                }}
              >
                {unit.operator}
              </Button>

              {units.unitsType == 'enum' ? (
                <EditorInputItem
                  value={unit.rhs.toString()}
                  onChange={(v) => {
                    unit.rhs = v
                    setUnits(cloneDeep(units))
                  }}
                />
              ) : (
                <NumberInput
                  isDisabled={units.unitsType == 'format'}
                  size='sm'
                  value={unit.rhs}
                  onChange={(_, v) => {
                    unit.rhs = v
                    setUnits(cloneDeep(units))
                  }}
                >
                  <NumberInputField />
                </NumberInput>
              )}

              <Input
                width='200px'
                size='sm'
                value={unit.unit}
                placeholder='e.g % , bytes'
                onChange={(e) => {
                  unit.unit = e.currentTarget.value
                  setUnits(cloneDeep(units))
                }}
              />
              {units.unitsType != 'format' && (
                <FaMinus
                  opacity='0.8'
                  cursor='pointer'
                  onClick={() => onRemoveUnit(i)}
                  fontSize='0.9rem'
                />
              )}
              {i != 0 && (
                <FaArrowUp
                  opacity='0.8'
                  cursor='pointer'
                  onClick={() => onLiftUnit(i)}
                  fontSize='0.9rem'
                />
              )}
            </HStack>
          )
        })}
      </VStack>
      <Button mt='2' size='sm' variant='outline' onClick={onSubmit}>
        {t.submit}
      </Button>
    </>
  )
}

// v0: string or number
export const formatUnit = (v0: any, units: Unit[], decimal: number) => {
  if (isEmpty(v0) || isEmpty(units)) {
    return v0
  }

  if (units.length == 1 && units[0].operator == 'x' && units[0].rhs == 0) {
    // string format unit
    const v = replaceWithVariables(units[0].unit, {
      [VariableCurrentValue]: v0,
    })
    return v
  }

  if (units.length > 0 && units[0].operator == '=') {
    // enum unit
    for (var i = 0; i < units.length; i++) {
      const unit = units[i]
      if (unit.rhs == v0) {
        return replaceWithVariables(unit.unit, {
          [VariableCurrentValue]: v0,
        })
      }
    }
  }
  if (!isNumber(v0)) {
    if (units.length == 0) {
      return v0
    } else {
      return v0 + units[0].unit
    }
  }

  let v = v0
  if (v0 < 0) {
    v = -1 * v0
  }

  if (isEmpty(units)) {
    return v0 < 0 ? round(v, decimal) * -1 : round(v, decimal)
  }

  if (v == 0) {
    return v
  }

  let index = 0
  let min
  // we need to find the min calc value that is greater than 1
  for (var i = 0; i < units.length; i++) {
    const unit = units[i]
    const res = calcValue(v, unit)
    if (res >= 1) {
      if (!min) {
        min = res
        index = i
        continue
      }
      if (res < min) {
        min = res
        index = i
        continue
      }
    }
  }

  if (min < 1 || !min) {
    // no calc value is greater than 1, we need to find the max one
    let max = 0
    for (var i = 0; i < units.length; i++) {
      const unit = units[i]
      const res = calcValue(v, unit)
      if (res > max) {
        max = res
        index = i
      }
    }
  }

  const unit = units[index]
  const res = calcValue(v, unit)
  if (v0 < 0) {
    return round(res, decimal) * -1 + unit.unit
  } else {
    return round(res, decimal) + unit.unit
  }
}

const calcValue = (v, unit: Unit) => {
  let res
  switch (unit.operator) {
    case 'x':
      res = v * unit.rhs
      break
    case '/':
      res = v / unit.rhs
      break
    default:
      res = v
      break
  }
  return res
}

export const initShortUnits = (): Unit[] => {
  return [
    {
      operator: '/',
      rhs: 1,
      unit: '',
    },
    {
      operator: '/',
      rhs: 1000,
      unit: 'k',
    },
    {
      operator: '/',
      rhs: 1000000,
      unit: 'm',
    },
  ]
}

export const initPercentUnits = (): Unit[] => {
  return [
    {
      operator: 'x',
      rhs: 100,
      unit: '%',
    },
  ]
}

export const initTimeUnits = (): Unit[] => {
  return [
    {
      operator: '/',
      rhs: 1,
      unit: 'ms',
    },
    {
      operator: '/',
      rhs: 1000,
      unit: 's',
    },
    {
      operator: '/',
      rhs: 60 * 1000,
      unit: 'm',
    },
    {
      operator: '/',
      rhs: 60 * 60 * 1000,
      unit: 'h',
    },
    {
      operator: '/',
      rhs: 24 * 60 * 60 * 1000,
      unit: 'd',
    },
  ]
}

export const initBytesUnits = (): Unit[] => {
  return [
    {
      operator: '/',
      rhs: 1,
      unit: 'B',
    },
    {
      operator: '/',
      rhs: 1024,
      unit: 'KB',
    },
    {
      operator: '/',
      rhs: 1024 * 1024,
      unit: 'MB',
    },
    {
      operator: '/',
      rhs: 1024 * 1024 * 1024,
      unit: 'GB',
    },
  ]
}
