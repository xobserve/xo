import { Box } from '@chakra-ui/layout';
import React, { CSSProperties } from 'react';


export interface OverlayProps {
  topRight1?: React.ReactNode[];
  topRight2?: React.ReactNode[];
  bottomLeft?: React.ReactNode[];
  blStyle?: CSSProperties;
}

export const GeomapOverlay = ({ topRight1, topRight2, bottomLeft, blStyle }: OverlayProps) => {
  const topRight1Exists = (topRight1 && topRight1.length > 0) ?? false;
  const styles = getStyles(topRight1Exists)
  return (
    <Box sx={{styles}}>
    <div className="geomap-overlay">
      {Boolean(topRight1?.length) && <div className="geomap-tr1">{topRight1}</div>}
      {Boolean(topRight2?.length) && <div className="geomap-tr2">{topRight2}</div>}
      {Boolean(bottomLeft?.length) && (
        <div className="geomap-bl" style={blStyle}>
          {bottomLeft}
        </div>
      )}
    </div>
    </Box>
  );
};


const getStyles = (topRight1Exists: boolean) => ({
    'geomap-overlay':  {
        position: 'absolute',
        width: '100%',
        height: '100%',
        'z-index': 500,
        'pointer-events': 'none'
    },
    "geomap-tr1": {
        right: '0.5em',
        'pointer-events': 'auto',
        position: 'absolute',
        top: '0.5em'
    },
    "geomap-tr2": {
        position: 'absolute',
        top: `${topRight1Exists ? '80' : '8'}px`,
        right: '8px',
        'pointer-events': 'auto',
    },
    "geomap-bl": {
        'position': 'absolute',
        bottom: '8px',
        left: '8px',
        'pointer-events': 'auto'
    }
})
