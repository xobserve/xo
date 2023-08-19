export interface Annotation {
    id: number 
    namespace: string 
    group: number 
    userId?: number
    color?: string 
    time: number 
    duration: string // 1s, 2m, 3h, 6h30m15s
    text: string
    tags: string[]
    created: string
}