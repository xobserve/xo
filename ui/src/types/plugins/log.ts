export interface LogStream  {
    name: string
    values: LogItem[]
}

export interface LogItem {
    timestamp: number // nano second
    content: string
}