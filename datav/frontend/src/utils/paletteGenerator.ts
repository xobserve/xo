// Copyright (c) 2017 Uber Technologies, Inc.
//

import { paletteColorNameToHex, palettes } from './colors'

// TS needs the precise return type
function strToRgb(s: string): [number, number, number] {
  if (s.length !== 7) {
    return [0, 0, 0]
  }
  const r = s.slice(1, 3)
  const g = s.slice(3, 5)
  const b = s.slice(5)
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
}

export class PaletteGenerator {
  colorsHex: string[]
  colorsRgb: [number, number, number][]
  cache: Map<string, number>
  currentIdx: number

  constructor(colorsHex: string[] = palettes.slice(18)) {
    this.colorsHex = colorsHex
    this.colorsRgb = colorsHex.map(strToRgb)
    this.cache = new Map()
    this.currentIdx = 0
  }

  _getColorIndex(key: string): number {
    let i = this.cache.get(key)
    if (i == null) {
      i = this.currentIdx
      this.cache.set(key, this.currentIdx)
      this.currentIdx = ++this.currentIdx % this.colorsHex.length
    }
    return i
  }

  /**
   * Will assign a color to an arbitrary key.
   * If the key has been used already, it will
   * use the same color.
   */
  getPaletteByKey(key: string) {
    const i = this._getColorIndex(key)
    return this.colorsHex[i]
  }

  getColorByKey(key: string) {
    const i = this._getColorIndex(key)
    return paletteColorNameToHex(this.colorsHex[i])
  }

  /**
   * Retrieve the RGB values associated with a key. Adds the key and associates
   * it with a color if the key is not recognized.
   * @return {number[]} An array of three ints [0, 255] representing a color.
   */
  getRgbColorByKey(key: string): [number, number, number] {
    const i = this._getColorIndex(key)
    return this.colorsRgb[i]
  }

  clear() {
    this.cache.clear()
    this.currentIdx = 0
  }
}

export default new PaletteGenerator()
