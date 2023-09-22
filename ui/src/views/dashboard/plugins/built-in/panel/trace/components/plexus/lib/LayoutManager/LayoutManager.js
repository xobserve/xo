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

import { ECoordinatorPhase } from './types';
import Coordinator from './Coordinator';
export default class LayoutManager {
  constructor(options) {
    this.layoutId = void 0;
    this.coordinator = void 0;
    this.pendingResult = void 0;
    this.options = void 0;
    this._handleUpdate = data => {
      const pendingResult = this.pendingResult;
      if (!pendingResult || data.layoutId !== pendingResult.id) {
        return;
      }
      if (data.type === ECoordinatorPhase.Positions) {
        const {
          isPositionsResolved,
          resolvePositions
        } = pendingResult;
        if (isPositionsResolved) {
          // eslint-disable-next-line no-console
          console.warn('Duplicate positiosn update', data);
          return;
        }
        const {
          graph,
          vertices
        } = data;
        if (!vertices || !resolvePositions) {
          // make flow happy
          throw new Error('Invalid state');
        }
        pendingResult.isPositionsResolved = true;
        resolvePositions({
          graph,
          vertices,
          isCancelled: false
        });
      } else if (data.type === ECoordinatorPhase.Done) {
        const {
          resolveLayout
        } = pendingResult;
        const {
          edges,
          graph,
          vertices
        } = data;
        if (!edges || !vertices || !resolveLayout) {
          // make flow happy
          throw new Error('Invalid state');
        }
        this.pendingResult = null;
        resolveLayout({
          edges,
          graph,
          vertices,
          isCancelled: false
        });
      } else {
        throw new Error('Unrecognized update type');
      }
    };
    this.options = options;
    this.layoutId = 0;
    this.coordinator = new Coordinator(this._handleUpdate);
    this.pendingResult = null;
  }
  getLayout(edges, vertices) {
    this._cancelPending();
    this.layoutId++;
    const id = this.layoutId;
    this.coordinator.getLayout(id, edges, vertices, this.options);
    this.pendingResult = {
      id,
      isPositionsResolved: false
    };
    const positions = new Promise(resolve => {
      if (this.pendingResult && id === this.pendingResult.id) {
        this.pendingResult.resolvePositions = resolve;
      }
    });
    const layout = new Promise(resolve => {
      if (this.pendingResult && id === this.pendingResult.id) {
        this.pendingResult.resolveLayout = resolve;
      }
    });
    return {
      layout,
      positions
    };
  }
  stopAndRelease() {
    this._cancelPending();
    this.coordinator.stopAndRelease();
  }
  _cancelPending() {
    const pending = this.pendingResult;
    if (pending) {
      if (!pending.isPositionsResolved && pending.resolvePositions) {
        pending.resolvePositions({
          isCancelled: true
        });
        pending.isPositionsResolved = true;
      }
      if (pending.resolveLayout) {
        pending.resolveLayout({
          isCancelled: true
        });
      }
      this.pendingResult = null;
    }
  }
}