import { TLayoutEdge, TLayoutGraph, TLayoutVertex } from '../../types';
export default function convPlain(str: string, parseEdges?: boolean): {
    graph: TLayoutGraph;
    vertices: TLayoutVertex[];
    edges: TLayoutEdge[] | null;
};
