import * as React from 'react';
type TProps = {
    classNamePrefix?: string | void;
    className?: string | void;
    contentHeight: number;
    contentWidth: number;
    viewAll: () => void;
    viewportHeight: number;
    viewportWidth: number;
    k?: number;
    x?: number;
    y?: number;
};
export declare function MiniMap(props: TProps): JSX.Element;
export declare namespace MiniMap {
    var defaultProps: {
        className: string;
        classNamePrefix: string;
    };
}
declare const _default: React.MemoExoticComponent<typeof MiniMap>;
export default _default;
