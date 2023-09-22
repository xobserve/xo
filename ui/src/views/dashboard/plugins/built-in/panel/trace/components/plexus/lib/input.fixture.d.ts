/// <reference types="react" />
declare const input: {
    vertices: ({
        key: string;
        data: {
            value: Date;
            message: string;
            err?: undefined;
        };
        label?: undefined;
    } | {
        key: number;
        label: string;
        data: {
            err: Error;
            message: string;
            value?: undefined;
        };
    } | {
        key: string;
        label: JSX.Element;
        data: {
            message: string;
            value?: undefined;
            err?: undefined;
        };
    } | {
        key: number;
        data: {
            value: RegExp;
            message: string;
            err?: undefined;
        };
        label?: undefined;
    })[];
    edges: ({
        from: string;
        to: number;
        label: string;
        data: string;
        isBidirectional?: undefined;
    } | {
        from: string;
        to: string;
        label: JSX.Element;
        data: string;
        isBidirectional?: undefined;
    } | {
        from: string;
        to: string;
        data: string;
        label?: undefined;
        isBidirectional?: undefined;
    } | {
        from: string;
        to: number;
        isBidirectional: boolean;
        data: string;
        label?: undefined;
    })[];
};
export default input;
export declare const sizedInput: {
    vertices: {
        vertex: {
            key: string;
            data: {
                value: Date;
                message: string;
                err?: undefined;
            };
            label?: undefined;
        } | {
            key: number;
            label: string;
            data: {
                err: Error;
                message: string;
                value?: undefined;
            };
        } | {
            key: string;
            label: JSX.Element;
            data: {
                message: string;
                value?: undefined;
                err?: undefined;
            };
        } | {
            key: number;
            data: {
                value: RegExp;
                message: string;
                err?: undefined;
            };
            label?: undefined;
        };
        height: number;
        width: number;
    }[];
    edges: ({
        from: string;
        to: number;
        label: string;
        data: string;
        isBidirectional?: undefined;
    } | {
        from: string;
        to: string;
        label: JSX.Element;
        data: string;
        isBidirectional?: undefined;
    } | {
        from: string;
        to: string;
        data: string;
        label?: undefined;
        isBidirectional?: undefined;
    } | {
        from: string;
        to: number;
        isBidirectional: boolean;
        data: string;
        label?: undefined;
    })[];
};
