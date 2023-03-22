import { ThresholdsConfig } from "./threshold";

export interface DataFrame {
    id: number;
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
    /**
     *  Meta info about how field and how to display it
     */
    config?: FieldConfig;
    values: any[]; // The raw field values
    labels?: {[key: string]: string};


    /**
     * Convert text to the field value
     */
    parse?: (value: any) => T;

    /**
   * Convert a value for display
   */
    display?: DisplayProcessor;

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


/**
 * Every property is optional
 *
 * Plugins may extend this with additional properties. Something like series overrides
 */
export interface FieldConfig<TOptions extends object = any> {
    /**
     * The display value for this field.  This supports template variables blank is auto
     */
    displayName?: string;
  
    /**
     * This can be used by data sources that return and explicit naming structure for values and labels
     * When this property is configured, this value is used rather than the default naming strategy.
     */
    displayNameFromDS?: string;
  
    /**
     * True if data source field supports ad-hoc filters
     */
    filterable?: boolean;
  
    // Numeric Options
    unit?: string;
    decimals?: number | null; // Significant digits (for display)
    min?: number | null;
    max?: number | null;
  
    // Convert input values into a display string
    mappings?: ValueMapping[];
  
    // Used when reducing field values
    nullValueMode?: NullValueMode;
  
    // Alternative to empty string
    noValue?: string;
  
    // Panel Specific Values
    custom?: TOptions;

      // Map numeric values to states
    thresholds?: ThresholdsConfig;


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


export interface FormattedValue {
    text: string;
    prefix?: string;
    suffix?: string;
  }

export type DisplayProcessor = (value: any, decimals?: DecimalCount) => DisplayValue;

export interface DisplayValue extends FormattedValue {
  /**
   *  Use isNaN to check if it is a real number
   */
  numeric: number;
  /**
   *  0-1 between min & max
   */
  percent?: number;
  /**
   *  Color based on mappings or threshold
   */
  color?: string;
  /**
   *  Icon based on mappings or threshold
   */
  icon?: string;
  title?: string;

  /**
   * Used in limited scenarios like legend reducer calculations
   */
  description?: string;
}

/**
 * These represents the display value with the longest title and text.
 * Used to align widths and heights when displaying multiple DisplayValues
 */
export interface DisplayValueAlignmentFactors extends FormattedValue {
  title: string;
}

export type DecimalCount = number | null | undefined;

export interface DecimalInfo {
  decimals: DecimalCount;
  scaledDecimals: DecimalCount;
}




export interface DataFrameFieldIndex {
    frameIndex: number;
    fieldIndex: number;
  }


  