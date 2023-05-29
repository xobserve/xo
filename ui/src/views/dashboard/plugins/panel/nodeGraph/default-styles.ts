import { NodeGraphSettings } from "types/dashboard"

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


export const getDefaultNodeStyle = (settings:NodeGraphSettings,colorMode?) => {
    return {
        selected: {
          stroke: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
          shadowColor: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
          lineWidth: 7,
          fill: 'transparent'
        },
        active: {
            stroke: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
            shadowColor: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
            lineWidth: 7,
            fill: 'transparent'
          },
          inactive: {
            fill: 'transparent',
          }
      }
}


export const getDefaultEdgeStyle = (settings:NodeGraphSettings,colorMode?) => {
    return {
        selected: {
          stroke: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
          shadowColor:colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
          lineWidth: 1,
        },
        active: {
            stroke: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
            shadowColor:colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
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