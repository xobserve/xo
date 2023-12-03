// Copyright 2023 xObserve.io Team

// <Box display="flex" justifyContent="right">
// <Decoration6 style={{height: '20px',width:"100%",position:"absolute",top:"null",right:"null",left:"null"}}
// /></Box>
export interface PanelStyles {
  palette: string
  border?: string
  borderOnHover: boolean
  decoration: DecorationStyles
  title: {
    position: 'left' | 'center'
    decoration: {
      type: PanelTitleDecorationType
      width: string
      height: string
      margin: string
    }
    fontSize: string
    fontWeight: string
    color: string
    paddingTop: string
    paddingBottom: string
    paddingLeft: string
    paddingRight: string
  }
  heightReduction: number
  widthReduction: number
  marginTop: number
  marginLeft: number
}

export interface DecorationStyles {
  type: PanelDecorationType
  width: string
  height: string
  top: string
  left: string
  justifyContent: 'left' | 'center' | 'right'
  reverse: boolean
}
export enum PanelDecorationType {
  None = 'None',
  Decoration1 = 'Decoration1',
  Decoration2 = 'Decoration2',
  Decoration3 = 'Decoration3',
  Decoration4 = 'Decoration4',
  Decoration5 = 'Decoration5',
  Decoration6 = 'Decoration6',
  Decoration8 = 'Decoration8',
  Decoration9 = 'Decoration9',
  Decoration10 = 'Decoration10',
  Decoration12 = 'Decoration12',
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
  Border13 = 'Border13',
}
