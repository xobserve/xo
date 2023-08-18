import React from "react"

const MIN_REGION_ANNOTATION_WIDTH = 6;
const AnnotationMarker = ({ annotation, width }) => {
    const isRegionAnnotation = width > MIN_REGION_ANNOTATION_WIDTH;
    let left = `${width / 2}px`;
    // console.log("here3333333:",annotation,width)
    return (<div>
        { 
        !isRegionAnnotation ? <div
            style={{
                left, 
                position: 'relative', 
                transform: 'translate3d(-50%,-50%, 0)' ,
                width:0,
                height:0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '4px solid rgba(0, 211, 255, 1)'
            }}
        /> : <div
        style={{
            width: `${width}px`,
            height: '5px',
            transform: 'translate3d(0%,-50%, 0)' ,
            // borderLeft: '4px solid transparent',
            // borderRight: '4px solid transparent',
            background: 'rgba(0, 211, 255, 1)'
        }}
    /> 
        
        }
    </div>)
}

export default AnnotationMarker