export const donutColors = {
    'success': '#61DDAA',
    'error': '#F08BB4',
}

// export const donutDarkColors = {
//     'success': '#61DDAA',
//     'error': '#F08BB4',
// }

export const getDefaultNodeLabel = (colorMode) =>{ 
    return {
        position: 'bottom',
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
        }
    }  
} 

export const getDefaultEdgeLabel = (colorMode) => {
    return  {
        autoRotate: true,
        refY: -10,
        style: {
            fill:  colorMode == "light" ? '#000' : '#fff',
            lineWidth: 5,
            opacity: 0,
        },
    }
}

export const getActiveEdgeLabelCfg = colorMode => {
    const cfg = getDefaultEdgeLabel(colorMode)
    cfg.style.opacity = 1
    return cfg
}

const lightColor = '#61DDAA'
const darkColor = 'rgb(0, 181, 216)'
export const getDefaultNodeStyle = (colorMode?) => {
    return {
        selected: {
          stroke: colorMode == "light" ? lightColor : darkColor,
          shadowColor: colorMode == "light" ? lightColor : darkColor,
          lineWidth: 7,
          fill: 'transparent'
        },
        active: {
            stroke: colorMode == "light" ? lightColor : darkColor,
            shadowColor: colorMode == "light" ? lightColor : darkColor,
            lineWidth: 7,
            fill: 'transparent'
          },
          inactive: {
            fill: 'transparent',
          }
      }
}


export const getDefaultEdgeStyle = (colorMode?) => {
    return {
        selected: {
          stroke: colorMode == "light" ? lightColor : darkColor,
          shadowColor:colorMode == "light" ? lightColor : darkColor,
          lineWidth: 1,
        },
        active: {
            stroke: colorMode == "light" ? lightColor : darkColor,
            shadowColor:colorMode == "light" ? lightColor : darkColor,
            lineWidth: 1,
          },
        inactive: {
            stroke: '#222',
            shadowColor: '#ccc',
            lineWidth: 1,
            opacity: 0,
          }
      }
}