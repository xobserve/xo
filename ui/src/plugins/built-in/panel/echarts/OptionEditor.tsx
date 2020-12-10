import React, { PureComponent } from 'react';
import { FormField as Field, localeData, currentLang, CodeEditor } from 'src/packages/datav-core/src';
import { PanelEditorProps } from 'src/packages/datav-core/src';
import { css } from 'emotion';

import { EchartsOptions, funcParams } from './types';

import './style.css';


const getStyles = () => ({
  span: css`
    padding: 2px;
    font-size: 14px;
  `,
});


export class OptionEditor extends PureComponent<PanelEditorProps<EchartsOptions>> {
  styles: any;

  constructor(props: any) {
    super(props);
    this.styles = getStyles();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <>
        <Field label={localeData[currentLang]['panel.echartsOptions']} description={localeData[currentLang]['panel.echartsOptionsDesc']}>
          <>
            <span className={this.styles.span}>{`function (${funcParams}) `} <span className="color-primary">&nbsp;{` {`}</span></span>
            <CodeEditor
                width="100%"
                height="400px"
                language="javascript"
                showLineNumbers={true}
                showMiniMap={false}
                value={this.props.options.optionsFunc}
                onBlur={(v) =>  this.props.onOptionsChange({ ...this.props.options, optionsFunc: v})}
        
              />
            <span className={this.styles.span}><span className="color-primary">{`}`}</span></span>
          </>
        </Field>
      </>
    );
  }
}
