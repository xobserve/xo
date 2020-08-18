import React, { PureComponent, RefObject } from 'react';
import { FormField as Field, Switch, currentTheme, ThemeType, localeData, currentLang } from 'src/packages/datav-core';
import { PanelEditorProps } from 'src/packages/datav-core';
import { css } from 'emotion';
import CodeMirror from 'codemirror';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/seti.css';

import 'codemirror/mode/javascript/javascript';

import 'codemirror/addon/display/autorefresh';

import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';

import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

import 'codemirror/addon/selection/active-line.js';
import 'codemirror/keymap/sublime.js';

import 'codemirror/addon/comment/comment.js';

// import 'codemirror/addon/hint/show-hint.css';
// import 'codemirror/addon/hint/show-hint.js';
// import 'codemirror/addon/hint/javascript-hint.js';

import { EchartsOptions, funcParams } from './types';

import './style.css';
import { FormattedMessage } from 'react-intl';

const getStyles = () => ({
  span: css`
    padding: 2px;
    font-size: 14px;
  `,
});


export class OptionEditor extends PureComponent<PanelEditorProps<EchartsOptions>> {
  editorRef: RefObject<HTMLElement> | any;
  editor: CodeMirror.EditorFromTextArea;
  styles: any;

  constructor(props: any) {
    super(props);

    this.editorRef = React.createRef();
    this.styles = getStyles();
  }

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(this.editorRef.current, {
      autoRefresh: true,
      theme: currentTheme === ThemeType.Light ? 'default' : 'seti',
      mode: 'javascript',
      keyMap: "sublime",
      tabSize: 2,
      smartIndent: true,
      indentUnit: 2,
      lineNumbers: true,
      inputStyle: 'contenteditable',
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      extraKeys: {
        'Cmd-/': 'toggleComment',
        'Ctrl-/': 'toggleComment',
      },
    });

    this.editor.on('blur', (editor: any) => {
      this.props.onOptionsChange({ ...this.props.options, optionsFunc: editor.doc.getValue() });
    });

    setTimeout(() => this.editor.refresh(), 300);
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.toTextArea();
    }
  }

  render() {
    return (
      <>
        <Field label={localeData[currentLang]['panel.echartsOptions']} description={localeData[currentLang]['panel.echartsOptionsDesc']}>
          <>
            <span className={this.styles.span}>{`function (${funcParams}) `} <span className="color-primary">&nbsp;{` {`}</span></span>
            <textarea ref={this.editorRef} defaultValue={this.props.options.optionsFunc} />
            <span className={this.styles.span}><span className="color-primary">{`}`}</span></span>
          </>
        </Field>
      </>
    );
  }
}
