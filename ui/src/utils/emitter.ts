// Copyright 2023 observex.io Team
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
import EventEmitter3, { EventEmitter } from 'eventemitter3';

export type AppEvent<T>  = {
    readonly name: string;
    payload?: T;
  }

export class Emitter {
  emitter: EventEmitter3;

  constructor() {
    this.emitter = new EventEmitter();
  }

  /**
   * DEPRECATED.
   */
  emit(name: string, data?: any): void;

  /**
   * Emits an `event` with `payload`.
   */
  emit<T extends undefined>(event: AppEvent<T>): void;
  //@ts-ignore
  emit<T extends Partial<T> extends T ? Partial<T> : never>(event: AppEvent<T>): void;
  emit<T>(event: AppEvent<T>, payload: T): void;
  emit<T>(event: AppEvent<T> | string, payload?: T | any): void {
    if (typeof event === 'string') {
      // console.log(`Using strings as events is deprecated and will be removed in a future version. (${event})`);
      this.emitter.emit(event, payload);
    } else {
      this.emitter.emit(event.name, payload);
    }
  }

  /**
   * DEPRECATED.
   */
  on(name: string, handler: (payload?: any) => void, scope?: any): void;

  /**
   * Handles `event` with `handler()` when emitted.
   */
  on<T extends undefined>(event: AppEvent<T>, handler: () => void, scope?: any): void;
  //@ts-ignore
  on<T extends Partial<T> extends T ? Partial<T> : never>(event: AppEvent<T>, handler: () => void, scope?: any): void;
  on<T>(event: AppEvent<T>, handler: (payload: T) => void, scope?: any): void;
  on<T>(event: AppEvent<T> | string, handler: (payload?: T | any) => void, scope?: any) {
    if (typeof event === 'string') {
      // console.log(`Using strings as events is deprecated and will be removed in a future version. (${event})`);
      this.emitter.on(event, handler);

      if (scope) {
        const unbind = scope.$on('$destroy', () => {
          this.emitter.off(event, handler);
          unbind();
        });
      }
      return;
    }

    this.emitter.on(event.name, handler);

    if (scope) {
      const unbind = scope.$on('$destroy', () => {
        this.emitter.off(event.name, handler);
        unbind();
      });
    }
  }

  /**
   * DEPRECATED.
   */
  off(name: string, handler: (payload?: any) => void): void;

  off<T extends undefined>(event: AppEvent<T>, handler: () => void): void;
  //@ts-ignore
  off<T extends Partial<T> extends T ? Partial<T> : never>(event: AppEvent<T>, handler: () => void, scope?: any): void;
  off<T>(event: AppEvent<T>, handler: (payload: T) => void): void;
  off<T>(event: AppEvent<T> | string, handler: (payload?: T | any) => void) {
    if (typeof event === 'string') {
      // console.log(`Using strings as events is deprecated and will be removed in a future version. (${event})`);
      this.emitter.off(event, handler);
      return;
    }
    
    this.emitter.off(event.name, handler);
  }

  removeAllListeners(evt?: string) {
    this.emitter.removeAllListeners(evt);
  }

  getEventCount(): number {
    return (this.emitter as any)._eventsCount;
  }
}
