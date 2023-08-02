// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";

import { Box, useColorMode } from "@chakra-ui/react";
import { editor } from "monaco-editor";
import MonacoEditor, { loader as monacoEditorLoader, useMonaco } from '@monaco-editor/react';
import { languageConfiguration, monarchlanguage } from '@grafana/monaco-logql';
import './CodeEditor.css'

interface Props {
  value: string
  language?: string
  onChange?: (value: string) => void
  onBlur?: any
  onMount?: (editor: editor.IStandaloneCodeEditor) => void
  readonly?: boolean
  fontSize?: number
  options?: editor.IEditorOptions
  isSingleLine?: boolean
  placeholder?: string
  bordered?: boolean
}

const singleLineOptions: editor.IEditorOptions = {
  fontSize: 15,
  codeLens: false,
  contextmenu: false,
  fixedOverflowWidgets: true,
  // lineDecorationsWidth: 8,
  lineNumbers: "off",
  folding: false,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  padding: { top: 5, bottom: 0 },
  renderLineHighlight: "none",
  scrollBeyondLastLine: false,
  scrollbar: { vertical: "hidden", horizontal: "hidden" },
  wordWrap: "on"
}

export const LogqlLang = 'logql';
// we must only run the lang-setup code once
let LANGUAGE_SETUP_STARTED = false;
function installLogQL(monaco) {
  if (LANGUAGE_SETUP_STARTED === false) {
    LANGUAGE_SETUP_STARTED = true;
    monaco.languages.register({ id: LogqlLang });

    monaco.languages.setMonarchTokensProvider(LogqlLang, monarchlanguage);
    monaco.languages.setLanguageConfiguration(LogqlLang, languageConfiguration);
  }
}

function CodeEditor({ value, onChange,onBlur, onMount, language = "typescript", readonly = false, fontSize = 12, options = {}, isSingleLine = false,placeholder=null,bordered=true }: Props) {
  const { colorMode } = useColorMode()
  const handleEditorOnMount = (editor) => {
    // show placeholder when mounted
    let placeholder = document.querySelector(
      '.monaco-placeholder'
    ) as HTMLElement | null;
    placeholder!.style.display = 'block';
    // focus on editor
    // editor.focus();
  };

  const handleEditorOnChange = (
    value: string | undefined,
  ) => {
    // if there is a value, hide the placeholder...
    // else show it
    let placeholder = document.querySelector(
      '.monaco-placeholder'
    ) as HTMLElement | null;
    if (!value) {
      placeholder!.style.display = 'block';
    } else {
      placeholder!.style.display = 'none';
    }
  };

  return (<Box width="100%" height="100%" className={(isSingleLine && bordered) ? "bordered" : null} pl={isSingleLine ? 2 : 0} onBlur={onBlur} position="relative" sx={{
    ".monaco-editor, .monaco-editor-background" : {
      backgroundColor: isSingleLine ? 'transparent' :null
    }
  }}><MonacoEditor
    language={language}
    theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
    value={value}
    height="100%"
    options={{
      minimap: {
        enabled: false
      },
      lineNumbers: "on",
      automaticLayout: true,
      lineNumbersMinChars: 4,
      lineDecorationsWidth: 0,
      overviewRulerBorder: false,
      scrollbar: {
        verticalSliderSize: 5,
        horizontalSliderSize: 5,
      },
      readOnly: readonly,
      fontSize: fontSize,
      ...(isSingleLine ? singleLineOptions : {}),
      ...options
    }}
    onChange={e => {
      placeholder && handleEditorOnChange(e)
      onChange && onChange(e)
    }}
    beforeMount={installLogQL}
    onMount={(e) => {
      !value && placeholder && handleEditorOnMount(e)
      onMount && onMount(e)
    }}
  />
    {placeholder && <div className="monaco-placeholder">{placeholder}</div>}
  </Box>)
}

export default CodeEditor