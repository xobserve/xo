import { TLayoutEdge, TLayoutGraph, TLayoutVertex, TSizeVertex } from '../../types';
export declare function vertexToDot(v: TSizeVertex): TSizeVertex;
export declare function edgeToPixels(graph: TLayoutGraph, e: TLayoutEdge<{}>): TLayoutEdge<{}>;
export declare function graphToPixels(graph: TLayoutGraph): {
    scale: number;
    height: number;
    width: number;
};
export declare function vertexToPixels(graph: TLayoutGraph, v: TLayoutVertex): TLayoutVertex;
