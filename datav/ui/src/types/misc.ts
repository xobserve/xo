// Copyright 2023 xObserve.io Team

export interface Help {
  title: string
  headers: string[]
  contents: string[][]
}

export type TNil = null | undefined

export enum ComparisonOperation {
  EQ = 'eq',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  NEQ = 'neq',
}

export enum AvailableStatus {
  OK = 0,
  DELETE = 1,
}

export enum Lang {
  EN = 'en',
  ZH = 'zh',
}
