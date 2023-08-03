export interface LogSeries  {
    labels: {[key: string]: string};
    values: [string,string][]
}



export interface LogThreshold {
    type: "label" | "content"
    key: string
    value: string 
    color: string
}


export interface Log {
    labels: {[key: string]: string}
    timestamp: string 
    content: string 
    highlight: string[]
}

export interface LogLabel {
    id: string
    name: string
    value: string
    count?: number
}
