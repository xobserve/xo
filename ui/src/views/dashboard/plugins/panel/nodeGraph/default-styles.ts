export const getDefaultNodeLabel = (colorMode) =>{ 
    return {
        position: 'bottom',
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
        }
    }  
} 

export const getDefaultEdgeLabel = colorMode => {
    return  {
        autoRotate: true,
        style: {
            fill:  colorMode == "light" ? '#000' : '#fff',
            lineWidth: 5,
        }
    }
}

export const getDefaultNodeStyle = (colorMode?) => {
    return {
        selected: {
          stroke: '#f00',
          shadowColor: '#00',
          lineWidth: 3,
        },
        active: {
            stroke: '#f00',
            shadowColor: '#00',
            lineWidth: 3,
          },
      }
}

export const getDefaultEdgeStyle = (colorMode?) => {
    return {
        selected: {
          stroke: '#f00',
          shadowColor: '#00',
          lineWidth: 3,
        },
        active: {
            stroke: '#f00',
            shadowColor: '#00',
            lineWidth: 3,
          },
      }
}