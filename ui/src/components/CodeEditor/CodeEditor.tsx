import React from "react";

import dynamic from "next/dynamic";
import { useColorMode } from "@chakra-ui/react";
import { editor } from "monaco-editor";
const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

interface Props {
    value: string 
    language?: string
    onChange?: (value: string) => void
    onMount?: (editor: editor.IStandaloneCodeEditor) => void
    readonly?: boolean
    
}
function CodeEditor({value, onChange,onMount,language="typescript",readonly=false}:Props) {
  const {colorMode} = useColorMode()
  return ( <MonacoEditor
      editorDidMount={(editor:editor.IStandaloneCodeEditor) => {
        onMount && onMount(editor)
        // @ts-ignore
        window.MonacoEnvironment.getWorkerUrl = (
          _moduleId: string,
          label: string
        ) => {
          if (label === "json")
            return "_next/static/json.worker.js";
          if (label === "css")
            return "_next/static/css.worker.js";
          if (label === "html")
            return "_next/static/html.worker.js";
          if (
            label === "typescript" ||
            label === "javascript"
          )
            return "_next/static/ts.worker.js";
          return "_next/static/editor.worker.js";
        };
      }}
      language={language}
      theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
      value={value}
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
        readOnly: readonly
      }}
      onChange={onChange}
      
    />)
}

export default CodeEditor