export interface GraphPluginData {
  series: GraphSeries[]
  value: number
}

export interface GraphSeries {
    // id: number;
    name?: string;
    fields: Field[]; // All fields of equal length

    // The number of rows
    length: number;

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


  export enum NullValueMode {
    Null = 'null',
    Ignore = 'connected',
    AsZero = 'null as zero',
  }

  export enum MappingType {
    ValueToText = 1,
    RangeToText = 2,
  }
  
  interface BaseMap {
    id: number;
    operator: string;
    text: string;
    type: MappingType;
  }

  

export type ValueMapping = ValueMap | RangeMap;

export interface ValueMap extends BaseMap {
  value: string;
}

export interface RangeMap extends BaseMap {
  from: string;
  to: string;
}




export type DecimalCount = number | null | undefined;

export interface DecimalInfo {
  decimals: DecimalCount;
  scaledDecimals: DecimalCount;
}


