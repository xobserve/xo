// Copyright (c) 2017 Uber Technologies, Inc.
//

export let EWorkerErrorType = /*#__PURE__*/ (function (EWorkerErrorType) {
  EWorkerErrorType['Error'] = 'Error'
  EWorkerErrorType['LayoutError'] = 'LayoutError'
  return EWorkerErrorType
})({})
export let ECoordinatorPhase = /*#__PURE__*/ (function (ECoordinatorPhase) {
  ECoordinatorPhase['Done'] = 'Done'
  ECoordinatorPhase['DotOnly'] = 'DotOnly'
  ECoordinatorPhase['Edges'] = 'Edges'
  ECoordinatorPhase['NotStarted'] = 'NotStarted'
  ECoordinatorPhase['Positions'] = 'Positions'
  return ECoordinatorPhase
})({})
export let EWorkerPhase = /*#__PURE__*/ (function (EWorkerPhase) {
  EWorkerPhase['DotOnly'] = 'DotOnly'
  EWorkerPhase['Edges'] = 'Edges'
  EWorkerPhase['Positions'] = 'Positions'
  return EWorkerPhase
})({})
