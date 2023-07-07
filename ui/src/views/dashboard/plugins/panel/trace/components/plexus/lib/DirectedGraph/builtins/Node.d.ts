import * as React from 'react';
type TProps = Record<string, any> & {
    classNamePrefix: string;
    children?: React.ReactNode;
    forwardedRef: any;
    hidden?: boolean;
    labelFactory: Function;
    left?: number;
    top?: number;
    vertex: any;
};
declare const _default: React.ForwardRefExoticComponent<Pick<TProps, string> & React.RefAttributes<{}>>;
export default _default;
