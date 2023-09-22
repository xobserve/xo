import * as React from 'react';
import MeasurableNode from './MeasurableNode';
import { TMeasurableNodeRenderer, TLayerType, TRendererUtils } from './types';
import { TLayoutVertex, TVertex } from '../types';
type TProps<T = {}> = Omit<TMeasurableNodeRenderer<T>, 'measurable' | 'measureNode'> & {
    getClassName: (name: string) => string;
    layerType: TLayerType;
    layoutVertices: TLayoutVertex<T>[] | null;
    nodeRefs: React.RefObject<MeasurableNode<T>>[];
    renderUtils: TRendererUtils;
    vertices: TVertex<T>[];
};
export default class MeasurableNodes<T = {}> extends React.Component<TProps<T>> {
    shouldComponentUpdate(np: TProps<T>): boolean;
    render(): JSX.Element[];
}
export {};
