// Copyright (c) 2017 Uber Technologies, Inc.
//

import { TNil } from '../../../types/misc'

// exported for tests
export const BG_COLOR = '#fff'
export const ITEM_ALPHA = 0.8
export const MIN_ITEM_HEIGHT = 2
export const MAX_TOTAL_HEIGHT = 200
export const MIN_ITEM_WIDTH = 10
export const MIN_TOTAL_HEIGHT = 60
export const MAX_ITEM_HEIGHT = 6

export default function renderIntoCanvas(
  canvas: HTMLCanvasElement,
  items: { valueWidth: number; valueOffset: number; serviceName: string }[],
  totalValueWidth: number,
  getFillColor: (serviceName: string) => [number, number, number],
  bg = '#fff',
) {
  const fillCache: Map<string, string | TNil> = new Map()
  const cHeight =
    items.length < MIN_TOTAL_HEIGHT
      ? MIN_TOTAL_HEIGHT
      : Math.min(items.length, MAX_TOTAL_HEIGHT)
  const cWidth = window.innerWidth * 2
  // eslint-disable-next-line no-param-reassign
  canvas.width = cWidth
  // eslint-disable-next-line no-param-reassign
  canvas.height = cHeight
  const itemHeight = Math.min(
    MAX_ITEM_HEIGHT,
    Math.max(MIN_ITEM_HEIGHT, cHeight / items.length),
  )
  const itemYChange = cHeight / items.length

  const ctx = canvas.getContext('2d', {
    alpha: false,
  }) as CanvasRenderingContext2D
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, cWidth, cHeight)
  for (let i = 0; i < items.length; i++) {
    const { valueWidth, valueOffset, serviceName } = items[i]
    const x = (valueOffset / totalValueWidth) * cWidth
    let width = (valueWidth / totalValueWidth) * cWidth
    if (width < MIN_ITEM_WIDTH) {
      width = MIN_ITEM_WIDTH
    }
    let fillStyle = fillCache.get(serviceName)
    if (!fillStyle) {
      fillStyle = `rgba(${getFillColor(serviceName).concat(ITEM_ALPHA).join()})`
      fillCache.set(serviceName, fillStyle)
    }
    ctx.fillStyle = fillStyle
    ctx.fillRect(x, i * itemYChange, width, itemHeight)
  }
}
