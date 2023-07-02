import { Box } from '@chakra-ui/react';
import { css } from '@emotion/css';
import CustomScrollbar from 'components/CustomScrollbar';
import { useExtraStyles } from 'hooks/useExtraTheme';
import React, { FC, CSSProperties, ComponentType } from 'react';
import { useMeasure } from 'react-use';





export type LegendPlacement = 'bottom' | 'right';

/**
 * @beta
 */
export interface VizLayoutProps {
  width: number;
  height: number;
  legend?: React.ReactElement<VizLayoutLegendProps> | null;
  children: (width: number, height: number) => React.ReactNode;
}

/**
 * @beta
 */
export interface VizLayoutComponentType extends FC<VizLayoutProps> {
  Legend: ComponentType<VizLayoutLegendProps>;
}

/**
 * @beta
 */
export const GraphLayout: VizLayoutComponentType = ({ width, height, legend, children }) => {
  const styles = useExtraStyles(getVizStyles);
  const containerStyle: CSSProperties = {
    display: 'flex',
    width: `${width}px`,
    height: `${height}px`,
  };
  const [legendRef, legendMeasure] = useMeasure<HTMLDivElement>();

  if (!legend) {
    return (
      <div tabIndex={0} style={containerStyle} className={styles.viz}>
        {children(width, height)}
      </div>
    );
  }

  const { placement, maxHeight = '35%', maxWidth = '60%' } = legend.props;

  let size: VizSize | null = null;

  const legendStyle: CSSProperties = {};


  switch (placement) {
    case 'bottom':
      containerStyle.flexDirection = 'column';
      legendStyle.maxHeight = maxHeight;

      if (legendMeasure) {
        size = { width, height: height - legendMeasure.height };
      }
      break;
    case 'right':
      containerStyle.flexDirection = 'row';
      legendStyle.maxWidth = maxWidth;

      if (legendMeasure) {
        size = { width: width - legendMeasure.width, height };
      }

      if (legend.props.width) {
        legendStyle.width = legend.props.width;
        size = { width: width - legend.props.width, height };
      }
      break;
  }

  // This happens when position is switched from bottom to right
  // Then we preserve old with for one render cycle until legend is measured in it's new position
  if (size?.width === 0) {
    size.width = width;
  }

  if (size?.height === 0) {
    size.height = height;
  }

  return (
    <div style={containerStyle}>
      <div tabIndex={0} className={styles.viz}>
        {size && children(size.width, size.height)}
      </div>
      <Box className='graph-legend' style={legendStyle} ref={legendRef} paddingLeft={placement == 'bottom' ? "20px" : 0} paddingRight={placement == 'bottom' ? "10px" : 0} minWidth="fit-content">
        <CustomScrollbar hideHorizontalTrack>{legend}</CustomScrollbar>
      </Box>
    </div>
  );
};

export const getVizStyles = (theme) => {
  return {
    viz: css({
      flexGrow: 2,
      borderRadius: 1,
      '&:focus-visible': getFocusStyles(theme),
    }),
  };
};
interface VizSize {
  width: number;
  height: number;
}

/**
 * @beta
 */
export interface VizLayoutLegendProps {
  placement: LegendPlacement;
  children: React.ReactNode;
  maxHeight?: string;
  maxWidth?: string;
  width?: number;
}

/**
 * @beta
 */
export const VizLayoutLegend: FC<VizLayoutLegendProps> = ({ children }) => {
  return <>{children}</>;
};

GraphLayout.Legend = VizLayoutLegend;



export function getFocusStyles(theme) {
  return {
    outline: '2px dotted transparent',
    outlineOffset: '2px',
    boxShadow: `0 0 0 2px ${theme.colors.background.canvas}, 0 0 0px 4px ${theme.colors.primary.main}`,
    transitionTimingFunction: `cubic-bezier(0.19, 1, 0.22, 1)`,
    transitionDuration: '0.2s',
    transitionProperty: 'outline, outline-offset, box-shadow',
  };
}