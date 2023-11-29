// Copyright (c) 2020 Uber Technologies, Inc.
//

export type TPathAgnosticDecorationSchema = {
  acronym: string
  id: string
  name: string
  summaryUrl: string
  opSummaryUrl?: string
  summaryPath: string
  opSummaryPath?: string
  detailLink?: string
  detailUrl?: string
  detailPath?: string
  detailColumnDefPath?: string
  opDetailUrl?: string
  opDetailPath?: string
  opDetailColumnDefPath?: string
}

export type TPadEntry = number | string

export type TNewData = Record<
  string,
  {
    withoutOp?: Record<string, TPadEntry>
    withOp?: Record<string, Record<string, TPadEntry>>
  }
>
