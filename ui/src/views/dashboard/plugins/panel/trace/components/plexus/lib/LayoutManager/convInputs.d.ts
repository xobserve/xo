import { TEdge, TLayoutEdge, TLayoutVertex, TSizeVertex } from '../types';
export default function convInputs(srcEdges: TEdge<any>[], inVertices: TSizeVertex<any>[]): {
    edges: {
        isBidirectional: any;
        from: string;
        to: string;
    }[];
    vertices: {
        width: number;
        height: number;
        vertex: {
            key: string;
        };
    }[];
    unmapEdges: (output: TLayoutEdge<{}>[]) => TLayoutEdge<unknown>[];
    unmapVertices: (output: TLayoutVertex<{}>[]) => TLayoutVertex<unknown>[];
};
