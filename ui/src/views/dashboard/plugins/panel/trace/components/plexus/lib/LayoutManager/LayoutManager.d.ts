import { TLayoutOptions, TUpdate } from './types';
import { TCancelled, TEdge, TLayoutDone, TPendingLayoutResult, TPositionsDone, TSizeVertex } from '../types';
import Coordinator from './Coordinator';
type TPendingResult<T, U> = {
    id: number;
    isPositionsResolved: boolean;
    resolvePositions?: (result: TCancelled | TPositionsDone<T>) => void;
    resolveLayout?: (result: TCancelled | TLayoutDone<T, U>) => void;
};
export default class LayoutManager {
    layoutId: number;
    coordinator: Coordinator;
    pendingResult: TPendingResult<any, any> | null;
    options: TLayoutOptions | void;
    constructor(options: TLayoutOptions | void);
    getLayout<T, U>(edges: TEdge<U>[], vertices: TSizeVertex<T>[]): TPendingLayoutResult<T, U>;
    stopAndRelease(): void;
    _cancelPending(): void;
    _handleUpdate: (data: TUpdate<any, any>) => void;
}
export {};
