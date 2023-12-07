// Copyright 2023 xobserve.io Team
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

import React, { useEffect, useRef } from 'react'

//--- import monaco-editor from node-modules instead of cdn ---
// import * as monaco from 'monaco-editor';
// import { loader } from '@monaco-editor/react';
// loader.config({ monaco });
// ---

import { Box, useColorMode } from '@chakra-ui/react'
import { editor } from 'monaco-editor'
import MonacoEditor from '@monaco-editor/react'
import { languageConfiguration, monarchlanguage } from '@grafana/monaco-logql'

import './CodeEditor.css'
import customColors from 'theme/colors'

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
  height?: string
}

const singleLineOptions: editor.IEditorOptions = {
  fontSize: customColors.baseFontSize * 0.9,
  codeLens: false,
  contextmenu: false,
  fixedOverflowWidgets: true,
  // lineDecorationsWidth: 8,
  lineNumbers: 'off',
  folding: false,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  padding: { top: 4, bottom: 0 },
  renderLineHighlight: 'none',
  scrollBeyondLastLine: false,
  scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
  wordWrap: 'on',
}

export const LogqlLang = 'logql'
// we must only run the lang-setup code once
let LANGUAGE_SETUP_STARTED = false
function installLogQL(monaco) {
  if (LANGUAGE_SETUP_STARTED === false) {
    LANGUAGE_SETUP_STARTED = true
    monaco.languages.register({ id: LogqlLang })

    monaco.languages.setMonarchTokensProvider(LogqlLang, monarchlanguage)
    monaco.languages.setLanguageConfiguration(LogqlLang, languageConfiguration)
  }
}

function CodeEditor({
  value,
  onChange,
  onBlur,
  onMount,
  language = 'typescript',
  readonly = false,
  fontSize = customColors.baseFontSize * 0.85,
  options = {},
  isSingleLine = false,
  placeholder = null,
  bordered = true,
  height = '100%',
}: Props) {
  const { colorMode } = useColorMode()
  const containerRef = useRef<HTMLDivElement>(null)
  const handleEditorOnMount = (editor) => {
    // show placeholder when mounted
    let placeholder = document.querySelector(
      '.monaco-placeholder',
    ) as HTMLElement | null
    placeholder!.style.display = 'block'
    // focus on editor
    // editor.focus();
  }

  useEffect(() => {
    if (placeholder) {
      handleEditorOnChange(value)
    }
  }, [value])

  const handleEditorOnChange = (value: string | undefined) => {
    // if there is a value, hide the placeholder...
    // else show it
    let placeholder = document.querySelector(
      '.monaco-placeholder',
    ) as HTMLElement | null
    if (!value) {
      placeholder!.style.display = 'block'
    } else {
      placeholder!.style.display = 'none'
    }
  }

  return (
    <Box
      ref={containerRef}
      width='100%'
      height='100%'
      className={isSingleLine && bordered ? 'bordered' : null}
      pl={isSingleLine ? 2 : 0}
      onBlur={onBlur}
      position='relative'
      sx={{
        '.monaco-editor, .monaco-editor-background': {
          backgroundColor: 'transparent',
        },
        '.monaco-editor, .margin': {
          backgroundColor: 'transparent !important',
        },
      }}
    >
      <MonacoEditor
        language={language}
        theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
        value={value}
        height={height}
        options={{
          minimap: {
            enabled: false,
          },
          lineNumbers: 'on',
          automaticLayout: true,
          lineNumbersMinChars: 4,
          lineDecorationsWidth: 0,
          overviewRulerBorder: false,
          scrollbar: {
            verticalSliderSize: 2,
            horizontalSliderSize: 2,
          },
          scrollBeyondLastLine: false,
          readOnly: readonly,
          fontSize: fontSize,
          ...(isSingleLine ? singleLineOptions : {}),
          ...options,
        }}
        onChange={(e) => {
          placeholder && handleEditorOnChange(e)
          onChange && onChange(e)
        }}
        beforeMount={installLogQL}
        onMount={(editor, monaco) => {
          !value && placeholder && handleEditorOnMount(editor)
          onMount && onMount(editor)

          if (isSingleLine) {
            const updateElementHeight = () => {
              const containerDiv = containerRef.current
              if (containerDiv !== null) {
                const pixelHeight = editor.getContentHeight()
                containerDiv.style.height = `${pixelHeight + 5}px`
                containerDiv.style.width = '100%'
                const pixelWidth = containerDiv.clientWidth
                editor.layout({ width: pixelWidth, height: pixelHeight })
              }
            }

            editor.onDidContentSizeChange(updateElementHeight)
            updateElementHeight()
          }
        }}
      />
      {placeholder && <div className='monaco-placeholder'>{placeholder}</div>}
    </Box>
  )
}

export default CodeEditor
