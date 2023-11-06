import * as React from 'react';
import MeasurableNode from './MeasurableNode';
import { TExposedGraphState, TLayerType, TSetOnContainer, TMeasurableNodeRenderer } from './types';
import { TSizeVertex, TVertex } from '../types';
type TProps<T = {}, U = {}> = Omit<TMeasurableNodeRenderer<T>, 'measurable'> & TSetOnContainer<T, U> & {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    senderKey: string;
    layerType: TLayerType;
    setSizeVertices: (senderKey: string, sizeVertices: TSizeVertex<T>[]) => void;
    standalone?: boolean;
};
type TState<T> = {
    nodeRefs: React.RefObject<MeasurableNode<T>>[];
    vertices: TVertex<T>[];
};
export default class MeasurableNodesLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>, TState<T>> {
    static getDerivedStateFromProps<T>(nextProps: TProps<T>, prevState: TState<T>): {
        vertices: TVertex<T>[];
        nodeRefs: React.RefObject<MeasurableNode<T>>[];
    } | null;
    constructor(props: TProps<T, U>);
    componentDidMount(): void;
    componentDidUpdate(): void;
    private measureNodes;
    render(): JSX.Element | null;
}
export {};
