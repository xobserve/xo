import { TLayoutOptions } from '../types';
import { TEdge, TLayoutVertex, TSizeVertex } from '../../types';
export default function toDot(edges: TEdge[], vertices: (TLayoutVertex | TSizeVertex)[], options?: TLayoutOptions | null): string;
