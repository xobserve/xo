export const get = (obj, key) => (obj != null ? obj[key] : null);

export const toJson = (obj) => obj;

export const forEach = (arr, iterator) => arr.forEach(iterator);