import React, { PureComponent } from 'react';
import { PanelProps, withTheme, DatavTheme, getBackendSrv} from 'src/packages/datav-core/src';
import { AlertsListOptions } from './types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from 'src/packages/datav-core/src';

interface Props extends PanelProps<AlertsListOptions> { 
  theme: DatavTheme
}
interface State {

}

class AlertsList extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.queryAlerts()
  }

  queryAlerts = async () => {
    await getBackendSrv().get('/api/alerting/history/filter',this.props.options)
  }

  render() {
    const { options, data, width, height,theme} = this.props
      const styles = getStyles();
      return (
        <></>
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
