import React, { PureComponent } from 'react';
import { PanelProps, withTheme, DatavTheme} from 'src/packages/datav-core/src';
import { AlertsListOptions } from './types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from 'src/packages/datav-core/src';

interface Props extends PanelProps<AlertsListOptions> { 
  theme: DatavTheme
}
interface State {

}

class AlertsList extends PureComponent<Props, State> {
  render() {
    const { options, data, width, height,theme} = this.props
      const styles = getStyles();
      return (
        <div
          className={cx(
            styles.wrapper,
            css`
              width: ${width}px;
              height: ${height}px;
            `
          )}
        >
          <svg
            className={styles.svg}
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
          >
            <g>
              <circle style={{ fill: `${theme.isLight ? theme.palette.greenBase : theme.palette.blue95}` }} r={100} />
            </g>
          </svg>

          <div className={styles.textBox}>
            {options.showSeriesCount && (
              <div
                className={css`
                  font-size: ${theme.typography.size[options.seriesCountSize]};
                `}
              >
                Number of series: {data.series.length}
              </div>
            )}
            <div>Text option value: {options.text}</div>
          </div>
        </div>
      );
  }
}



export default withTheme(AlertsList)

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
