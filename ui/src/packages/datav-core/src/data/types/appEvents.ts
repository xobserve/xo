

 type AppEvent<T>  = {
  readonly name: string;
  payload?: T;
}

export type AlertPayload = [string, string?];
export type AlertErrorPayload = [string, (string | Error)?];



export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;

const typeList: Set<string> = new Set();
export function eventFactory<T = undefined>(name: string): AppEvent<T> {
  if (typeList.has(name)) {
    throw new Error(`There is already an event defined with type '${name}'`);
  }

  typeList.add(name);
  return { name };
}


export const alertSuccess = eventFactory<AlertPayload>('alert-success');
export const alertWarning = eventFactory<AlertPayload>('alert-warning');
export const alertError = eventFactory<AlertErrorPayload>('alert-error');
 
