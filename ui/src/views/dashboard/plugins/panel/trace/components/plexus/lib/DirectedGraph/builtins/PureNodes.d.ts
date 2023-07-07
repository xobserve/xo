import * as React from 'react';
import { TPropsFactoryFn } from '../types';
import { TLayoutVertex, TVertex } from '../../types';
type TProps<T> = {
    classNamePrefix?: string | null;
    getNodeLabel: ((vertex: TVertex<T>) => React.ReactNode) | null;
    layoutVertices: TLayoutVertex[] | null;
    setOnNode?: TPropsFactoryFn<TVertex> | null;
    vertexRefs: {
        current: HTMLElement | null;
    }[];
    vertices: TVertex[];
};
export default class PureNodes<T> extends React.PureComponent<TProps<T>> {
    _renderVertices(): JSX.Element[];
    _renderLayoutVertices(): JSX.Element[] | null;
    render(): JSX.Element[] | null;
}
export {};
