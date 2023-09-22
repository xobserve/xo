export type TLayoutGraph = {
    height: number;
    scale: number;
    width: number;
};
export type TVertexKey = string;
export type TVertex<T = {}> = T & {
    key: TVertexKey;
};
export type TSizeVertex<T = {}> = {
    vertex: TVertex<T>;
    width: number;
    height: number;
};
export type TLayoutVertex<T = {}> = TSizeVertex<T> & {
    left: number;
    top: number;
};
export type TEdge<T = {}> = T & {
    from: TVertexKey;
    to: TVertexKey;
    isBidirectional?: boolean;
};
export type TLayoutEdge<T = {}> = {
    edge: TEdge<T>;
    pathPoints: [number, number][];
};
export type TCancelled = {
    isCancelled: true;
};
export type TPositionsDone<T = Record<string, unknown>> = {
    isCancelled: false;
    graph: TLayoutGraph;
    vertices: TLayoutVertex<T>[];
};
export type TLayoutDone<T = Record<string, unknown>, U = Record<string, unknown>> = {
    isCancelled: false;
    edges: TLayoutEdge<U>[];
    graph: TLayoutGraph;
    vertices: TLayoutVertex<T>[];
};
export type TPendingLayoutResult<T = Record<string, unknown>, U = Record<string, unknown>> = {
    positions: Promise<TPositionsDone<T> | TCancelled>;
    layout: Promise<TLayoutDone<T, U> | TCancelled>;
};
