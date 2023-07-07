import LayoutWorker from './layout.worker.bundled';
import { ECoordinatorPhase, EWorkerPhase, TLayoutOptions, TUpdate, TWorkerOutputMessage } from './types';
import { TEdge, TLayoutVertex, TSizeVertex, TLayoutEdge } from '../types';
type TCurrentLayout = {
    cleaned: {
        edges: TEdge<{}>[];
        vertices: TSizeVertex<{}>[];
    };
    id: number;
    input: {
        edges: TEdge<any>[];
        unmapEdges: (output: TLayoutEdge<{}>[]) => TLayoutEdge<any>[];
        unmapVertices: (output: TLayoutVertex<{}>[]) => TLayoutVertex<any>[];
        vertices: TSizeVertex<any>[];
    };
    options: TLayoutOptions | null;
    status: {
        workerId?: number | null;
        phase: ECoordinatorPhase;
    };
};
export default class Coordinator {
    currentLayout: TCurrentLayout | null;
    nextWorkerId: number;
    idleWorkers: LayoutWorker[];
    busyWorkers: LayoutWorker[];
    callback: (update: TUpdate<any, any>) => void;
    constructor(callback: (update: TUpdate<any, any>) => void);
    getLayout<T, U>(id: number, inEdges: TEdge<U>[], inVertices: TSizeVertex<T>[], options: TLayoutOptions | void): void;
    stopAndRelease(): void;
    _initWorker(): LayoutWorker;
    _makeWorkerIdle(worker: LayoutWorker): void;
    _postWork(phase: EWorkerPhase, edges: TEdge[], vertices: TSizeVertex[] | TLayoutVertex[]): void;
    _handleVizWorkerError: (event: ErrorEvent) => void;
    _handleVizWorkerMessageError: (event: ErrorEvent) => void;
    _handleVizWorkerMessage: (event: MessageEvent) => void;
    _processResult(phase: EWorkerPhase, workerMessage: TWorkerOutputMessage): void;
}
export {};
