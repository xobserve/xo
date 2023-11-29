// Copyright (c) 2017 Uber Technologies, Inc.
//

// // export default {
// const updateTypes = {
//   DRAG_END: 'DRAG_END',
//   DRAG_MOVE: 'DRAG_MOVE',
//   DRAG_START: 'DRAG_START',
//   MOUSE_ENTER: 'MOUSE_ENTER',
//   MOUSE_LEAVE: 'MOUSE_LEAVE',
//   MOUSE_MOVE: 'MOUSE_MOVE',
// };

// const typeUpdateTypes = updateTypes as { [K in keyof typeof updateTypes]: K };

enum EUpdateTypes {
  DragEnd = 'DragEnd',
  DragMove = 'DragMove',
  DragStart = 'DragStart',
  MouseEnter = 'MouseEnter',
  MouseLeave = 'MouseLeave',
  MouseMove = 'MouseMove',
}

export default EUpdateTypes
