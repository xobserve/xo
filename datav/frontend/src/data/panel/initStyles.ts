// Copyright 2023 xObserve.io Team

import {
  PanelBorderType,
  PanelDecorationType,
  PanelStyles,
  PanelTitleDecorationType,
} from 'types/panel/styles'

export const initPanelStyles: PanelStyles = {
  palette: 'echarts-light',
  border: PanelBorderType.None,
  borderOnHover: true,
  title: {
    position: 'left',
    decoration: {
      type: PanelTitleDecorationType.None,
      width: '160px',
      height: '50px',
      margin: '10px',
    },
    fontSize: '14px',
    fontWeight: '500',
    color: 'inherit',
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  decoration: {
    type: PanelDecorationType.None,
    width: '100%',
    height: '20px',
    top: '-30px',
    left: '',
    justifyContent: 'center',
    reverse: false,
  },

  heightReduction: 0,
  widthReduction: 0,
  marginTop: 0,
  marginLeft: 0,
}
