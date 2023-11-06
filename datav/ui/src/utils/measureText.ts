// Copyright 2023 xObserve.io Team
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

import { canvasCtx } from "src/App";

const cache = new Map<string, TextMetrics>();
const cacheLimit = 500;
let ctxFontStyle = '';

/**
 * @internal
 */
export function getCanvasContext() {
  return canvasCtx;
}

/**
 * @beta
 */
export function measureText(text: string, fontSize=16, fontWeight = 400): TextMetrics {
  const fontStyle = `${fontWeight} ${fontSize}px 'Inter'`;
  const cacheKey = text + fontStyle;
  const fromCache = cache.get(cacheKey);

  if (fromCache) {
    return fromCache;
  }

  const context = getCanvasContext();

  if (ctxFontStyle !== fontStyle) {
    context.font = fontStyle;
  }

  const metrics = context.measureText(text);

  if (cache.size === cacheLimit) {
    cache.clear();
  }

  cache.set(cacheKey, metrics);

  return metrics;
}

/**
 * @beta
 */
export function calculateFontSize(text: string, width: number, height: number, lineHeight: number, maxSize?: number) {
  // calculate width in 14px
  const textSize = measureText(text, 14);
  // how much bigger than 14px can we make it while staying within our width constraints
  const fontSizeBasedOnWidth = (width / (textSize.width + 2)) * 14;
  const fontSizeBasedOnHeight = height / lineHeight;

  // final fontSize
  const optimalSize = Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth);
  return Math.min(optimalSize, maxSize ?? optimalSize);
}
