// Copyright 2023 xObserve.io Team

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'src/i18n/i18n'
import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react'
import theme from 'theme'

const embed = window.location.href.includes('embed=true')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider
    theme={theme}
    colorModeManager={createLocalStorageManager(
      embed ? 'xobserve-embed-theme' : 'xobserve-theme',
    )}
  >
    <App />
  </ChakraProvider>,
)
