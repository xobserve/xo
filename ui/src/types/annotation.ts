export interface Annotation {
    id: number 
    namespace: string 
    group: number 
    userId?: number
    color?: string 
    time: number 
    timeEnd: number
    text: string
    tags: string[]
}