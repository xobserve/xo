export interface SeriesData {
    id: number;
    name?: string;
    fields: Field[]; // All fields of equal length

    // The number of rows
    length?: number;

    // series color showing in graph
    color?: string 
}

export enum FieldType {
    Time = 'time', // or date
    Number = 'number',
    String = 'string',
    Boolean = 'boolean',
    // Used to detect that the value is some kind of trace data to help with the visualisation and processing.
    Trace = 'trace',
    Other = 'other', // Object, Array, etc
}

export interface Field<T = any, V = Vector<T>> {
    /**
     * Name of the field (column)
     */
    name: string;
    /**
     *  Field value type (string, number, etc)
     */
    type: FieldType;
    values: any[]; // The raw field values
    labels?: {[key: string]: string};


    state?: any
}


export interface Vector<T = any> {
    length: number;

    /**
     * Access the value by index (Like an array)
     */
    get(index: number): T;

    /**
     * Get the resutls as an array.
     */
    toArray(): T[];
}

/**
 * Apache arrow vectors are Read/Write
 */
export interface ReadWriteVector<T = any> extends Vector<T> {
    set: (index: number, value: T) => void;
}

/**
 * Vector with standard manipulation functions
 */
export interface MutableVector<T = any> extends ReadWriteVector<T> {
    /**
     * Adds the value to the vector
     */
    add: (value: T) => void;

    /**
     * modifies the vector so it is now the opposite order
     */
    reverse: () => void;
}







