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

import { useColorMode } from "@chakra-ui/react";
import { editor } from "monaco-editor";
import MonacoEditor from "react-monaco-editor"
import './useMonacoWorker.js'
import { languageConfiguration, monarchlanguage } from '@grafana/monaco-logql';

interface Props {
    value: string 
    language?: string
    onChange?: (value: string) => void
    onMount?: (editor: editor.IStandaloneCodeEditor) => void
    readonly?: boolean
    fontSize?: number
    showLineNumber?: boolean
}
const LANG_ID = 'logql';
// we must only run the lang-setup code once
let LANGUAGE_SETUP_STARTED = false;
function ensureLogQL(monaco) {
  if (LANGUAGE_SETUP_STARTED === false) {
    LANGUAGE_SETUP_STARTED = true;
    monaco.languages.register({ id: LANG_ID });

    monaco.languages.setMonarchTokensProvider(LANG_ID, monarchlanguage);
    monaco.languages.setLanguageConfiguration(LANG_ID, languageConfiguration);
  }
}

function CodeEditor({value, onChange,onMount,language="typescript",readonly=false,fontSize=12, showLineNumber=true}:Props) {
  const {colorMode} = useColorMode()
  return ( <MonacoEditor
      language={language}
      theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
      value={value}
      options={{
        minimap: {
          enabled: false
        },
        lineNumbers: showLineNumber ? "on" : "off",
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
      }}
      onChange={onChange}
     editorWillMount={ensureLogQL} 
    />)
}

export default CodeEditor



// function CodeEditor({ value, onChange, onMount, language = "typescript", readonly = false, fontSize = 12 }: Props) {
//   const { colorMode } = useColorMode() 
//   useEffect(() => {
//     monaco.editor.create(document.getElementById('monaco-container'), {
//       value: value,
//       language: language,
//       readOnly: readonly,
//       lineNumbers: "on",
//       lineNumbersMinChars: 4,
//       lineDecorationsWidth: 0,
//       scrollbar: {
//         verticalSliderSize: 5,
//         horizontalSliderSize: 5,
//       },
//       automaticLayout: true,
//       minimap: {
//         enabled: false
//       },
//       fontSize: fontSize,
//       theme: colorMode === "dark" ? "vs-dark" : "vs-light",

//     });
//   }, [colorMode])
//   return (<div id="monaco-container"></div>)
// }