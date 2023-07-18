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

import lightTheme from 'src/data/theme/light.json'
import darkTheme from 'src/data/theme/dark.json'
import { useColorMode } from '@chakra-ui/react'
import memoizeOne from 'memoize-one';

const useExtraTheme = () => {
    const {colorMode} = useColorMode()

    const theme = colorMode === "light" ? lightTheme : darkTheme
    
    return theme
}

export default useExtraTheme

export const memoizedStyleCreators = new WeakMap();
export const useExtraStyles = (getStyles) => {
    const theme = useExtraTheme();

  let memoizedStyleCreator = memoizedStyleCreators.get(getStyles) as typeof getStyles;
  if (!memoizedStyleCreator) {
    memoizedStyleCreator = stylesFactory(getStyles);
    memoizedStyleCreators.set(getStyles, memoizedStyleCreator);
  }

  return memoizedStyleCreator(theme);
}




/**
 * @public
 * @deprecated use useStyles hook
 *  Creates memoized version of styles creator
 * @param stylesCreator function accepting dependencies based on which styles are created
 */
export function stylesFactory<ResultFn extends (this: any, ...newArgs: any[]) => ReturnType<ResultFn>>(
  stylesCreator: ResultFn
) {
  return memoizeOne(stylesCreator);
}