import { NodeGraphSettings } from "types/panel/plugins"

export const getDefaultNodeLabel = (colorMode) => {
    return {
        position: 'bottom',
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
        }
    }
}

export const getDefaultEdgeLabel = (colorMode, settings: NodeGraphSettings) => {
    return {
        autoRotate: true,
        refY: -10,
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
            lineWidth: 5,
            opacity: settings.edge.display ? 1 : 0,
        },
    }
}

export const getActiveEdgeLabelCfg = (colorMode, settings: NodeGraphSettings) => {
    const cfg = getDefaultEdgeLabel(colorMode, settings)
    cfg.style.opacity = 1
    return cfg
}


export const getDefaultNodeStyle = (settings: NodeGraphSettings, colorMode?) => {
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


export const getDefaultEdgeStyle = (settings: NodeGraphSettings, colorMode?) => {
    return {
        selected: {
            stroke: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
            shadowColor: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
            lineWidth: 1,
        },
        active: {
            stroke: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
            shadowColor: colorMode == "light" ? settings.edge.highlightColor.light : settings.edge.highlightColor.dark,
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