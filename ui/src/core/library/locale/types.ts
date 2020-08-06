export enum Langs  {
    Chinese = 'zh_CN',
    English = 'en_US'
}

export interface localeData  {
    [key:string]:string
}

export interface locale  {
    [key:string]:localeData
}
