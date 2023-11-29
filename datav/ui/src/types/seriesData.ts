// Copyright 2023 xObserve.io Team

export interface SeriesData {
  queryId?: number
  name?: string
  fields: Field[] // All fields of equal length

  // The number of rows
  length?: number

  // series color showing in graph
  color?: string

  rawName?: string // used for name override
  labels?: Record<string, string>
}

export enum FieldType {
  Time = 'time', // or date
  Number = 'number',
  String = 'string',
  Boolean = 'boolean',
  // Used to detect that the value is some kind of trace data to help with the visualisation and processing.
  Trace = 'trace',
  Other = 'other', // Object, Array, etc
  Geo = 'geo',
}

export interface Field<T = any> {
  /**
   * Name of the field (column)
   */
  name: string
  /**
   *  Field value type (string, number, etc)
   */
  type?: FieldType
  values?: T[] // The raw field values
  labels?: { [key: string]: string }
}
