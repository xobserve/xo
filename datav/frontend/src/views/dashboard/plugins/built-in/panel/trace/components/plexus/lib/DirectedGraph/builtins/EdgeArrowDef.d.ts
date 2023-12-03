import * as React from 'react';
type TProps = {
    id: string;
    scaleDampener: number;
    zoomScale?: number | null;
};
export default class EdgeArrowDef extends React.PureComponent<TProps> {
    static defaultProps: {
        zoomScale: null;
        scaleDampener: number;
    };
    static getId(idBase: string): string;
    static getIriRef(idBase: string): string;
    render(): JSX.Element;
}
export {};
