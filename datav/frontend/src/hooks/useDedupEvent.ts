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

import useBus from 'use-bus'

const receivedEvents = new Set()

// receive events , filter out the duplicated ones
// expires:  continue to receive events after this time, in milliseconds
export const useDedupEvent = (event: string, callback, expires = 500) => {
  useBus(
    (e) => {
      return e.type == event
    },
    (e) => {
      if (!receivedEvents.has(e.type)) {
        callback()
        receivedEvents.add(e.type)
        setTimeout(() => {
          receivedEvents.delete(e.type)
        }, expires)
      }
    },
  )
}
