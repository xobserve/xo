// Copyright 2023 Datav.io Team
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

import { HStack, Text } from "@chakra-ui/react"
import { Button, Input } from "antd"
import React, { useEffect, useState } from "react"
import { TableColumn } from "types/plugins/table"

export const setTableFilter = (column: TableColumn, data, filter?) => {
  if (data.length > 0) {
    const value = data[0][column.dataIndex]
    filter = filter ?? (typeof value == "number" ? "number" : "string")

    if (filter == "number") {
      column.onFilter = (value, record) => {
        let min = null
        let max = null
     
        if (value) {
          const r = value.toString().split("-")
          if (r.length == 2) {
            if (r[0].trim() == "") {
              min = null
            } else {
              min = Number(r[0])
            }
            if (r[1].trim() == "") {
              max = null
            } else {
              max = Number(r[1])
            }
          }
        }

        if (min == null && max == null) {
          return true
        }

        if (isNaN(min) || isNaN(max)) {
          return false
        }
        const v = record[column.dataIndex]
        if (min !== null && v < min) {
          return false
        }

        if (max != null && v > max) {
          return false
        }

        return true
      }

      column.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <NumberFilter   onChange={(v) => {
              setSelectedKeys(v ? [v] : [])
            }}   value={selectedKeys[0]} />
          <Button
            type="primary"
            onClick={() => confirm({ closeDropdown: false })}
            size="small"
            style={{ marginTop: 8}}
          >
            Search
          </Button>
        </div>
      )
    } else {
      column.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder={`Search ${column.dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm({ closeDropdown: false })}
            style={{ display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm({ closeDropdown: false })}
            size="small"
            style={{ width: 90, marginTop: 8 }}
          >
            Search
          </Button>
        </div>
      )
      column.onFilter = (value, record) =>
        record[column.dataIndex]
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase())
    }
  }
  column.filterSearch = true
}


const NumberFilter = ({ value,onChange }) => {
  const [min, setMin] = useState<string>('')
  const [max, setMax] = useState<string>('')
  useEffect(() => {
    if (value) {
      const r = value.split("-")
      if (r.length == 2) {
        setMin(r[0])
        setMax(r[1])
      }
    }

  }, [value])

  return (<HStack>
    <Input
      placeholder="min"
      value={min}
      onChange={(e) => setMin(e.target.value)}
      onBlur={() => onChange(`${min}-${max}`)}
    />
    <Text minW="fit-content">to</Text>
    <Input
      placeholder="max"
      value={max}
      onChange={(e) => setMax(e.target.value)}
      onBlur={() => onChange(`${min}-${max}`)}
    />
  </HStack>)
}