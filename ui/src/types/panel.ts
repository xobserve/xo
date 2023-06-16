
export interface PanelStyles {
    transparent?: boolean
    showBorder?: boolean
    border?: string
    decoration?: string
    title?: {
        decoration?: {
            type?: PanelTitleDecorationType
            width?: string
            height?: string
            margin?: string
        }
        fontSize: string
        paddingTop:string
        paddingBottom:string 
        paddingLeft:string
        paddingRight: string
    }
}

export enum PanelTitleDecorationType {
    None = 'None',
    Decoration7 = 'Decoration7',
    Decoration11 = 'Decoration11',
}

export enum PanelBorderType {
    None = 'None',
    Normal = 'Normal',
    Border1 = 'Border1',
    Border2 = 'Border2',
    Border3 = 'Border3',
    Border4 = 'Border4',
    Border5 = 'Border5',
    Border6 = 'Border6',
    Border7 = 'Border7',
    Border8 = 'Border8',
    Border9 = 'Border9',
    Border10 = 'Border10',
    Border11 = 'Border11',
    Border12 = 'Border12',
    Border13 = 'Border13'
}