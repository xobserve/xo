import * as React from 'react';
import { TPropsFactoryFn } from '../types';
import { TEdge, TLayoutEdge } from '../../types';
type TProps = {
    arrowIriRef: string;
    layoutEdges: TLayoutEdge[];
    setOnEdgePath?: TPropsFactoryFn<TEdge> | null;
};
export default class PureEdges extends React.PureComponent<TProps> {
    render(): JSX.Element[];
}
export {};
