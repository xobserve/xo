// Copyright (c) 2017 Uber Technologies, Inc.
//
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

export let EWorkerErrorType = /*#__PURE__*/function (EWorkerErrorType) {
  EWorkerErrorType["Error"] = "Error";
  EWorkerErrorType["LayoutError"] = "LayoutError";
  return EWorkerErrorType;
}({});
export let ECoordinatorPhase = /*#__PURE__*/function (ECoordinatorPhase) {
  ECoordinatorPhase["Done"] = "Done";
  ECoordinatorPhase["DotOnly"] = "DotOnly";
  ECoordinatorPhase["Edges"] = "Edges";
  ECoordinatorPhase["NotStarted"] = "NotStarted";
  ECoordinatorPhase["Positions"] = "Positions";
  return ECoordinatorPhase;
}({});
export let EWorkerPhase = /*#__PURE__*/function (EWorkerPhase) {
  EWorkerPhase["DotOnly"] = "DotOnly";
  EWorkerPhase["Edges"] = "Edges";
  EWorkerPhase["Positions"] = "Positions";
  return EWorkerPhase;
}({});