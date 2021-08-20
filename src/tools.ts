// -----------------------------  types  -----------------------------
type fun = (...params: any[]) => any;
type fun1 = (p: any) => any;
type objectKeys = string | number;
type O = { [key in objectKeys]: any };

// -----------------------------  functional tools  -----------------------------
export function pipe<T extends fun> (fst: T, ...fns: T[]) {
  return (...params: Parameters<T>) =>
    fns.reduce((p, fn) => fn(p), fst(...params));
}
export function aim<T extends fun>  (fn: T, ...args: any[]): (...args:any[])=>ReturnType<T> {
  return (...newargs: any[]) =>
    fn(...newargs, ...args);
}
export function curry<T extends fun>  (fn: T, ...args: any[]): (...args:any[])=>ReturnType<T> {
  return (...newargs: any[]) =>
    fn(...args, ...newargs);
}
export function fork<T extends fun>(...fns: T[]) {
  return (...params: Parameters<T>) => fns.map((fn) => fn(...params));
}

export const pluck = (obj: O) => (prop: objectKeys) => obj[prop];

export function guard<T extends fun>(fn: T, ...guards: T[]) {
  return (...p: Parameters<T>) => guards.every((f) => f(...p)) && fn(...p);
}
export function pass<T extends fun>(fn: T, ...guards: T[]) {
  return (...p: Parameters<T>) => guards.some((f) => f(...p)) && fn(...p);
}

export const deadFn = function deadFn() {};

export const opt = (switchs: O) => {
  switchs = expandKeys(switchs);
  return (...p: any[]) => _switch.object(switchs, ...p);
};
const _switch: any = {
  function: (f: fun, ...p: any[]) => f(...p),
  object: (switchs: O, ...p: any[]) => {
    const key = switchs._(...p);
    return _switch?.[typeof switchs[key]](switchs[key], ...p) || switchs[key];
  },
};

// -----------------------------  Object tools  -----------------------------
export function keys<T extends {}>(o: T): (keyof T)[] {
  return Object.keys(o) as (keyof T)[];
}
export const each = (fn: fun, o: O) => keys(o).forEach((k) => fn(o[k], k, o));
export const map = (fn: fun, o: O) => keys(o).map((k) => fn(o[k], k, o));
export const reduce = (fn: fun, mem: any, o: O) =>
  keys(o).reduce((m, k) => fn(o[k], m, k, o), mem);
export const find = () => (fn: fun, o: O) =>
  keys(o).find((k) => fn(o[k], k, o));
export const filter = () => (fn: fun, o: O) =>
  keys(o).filter((k) => fn(o[k], k, o));
export const every = () => (fn: fun, o: O) =>
  keys(o).every((k) => fn(o[k], k, o));
export const some = () => (fn: fun, o: O) =>
  keys(o).some((k) => fn(o[k], k, o));
export const at = (n = 0, o: O) => o[(n + o.length) % o.length];

export function isObject(o: O) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

// -----------------------------  helper tools  -----------------------------

export function expandKeys(o: O, delimiter = ",", out: O = {}) {
  keys(o).forEach((key) => {
    const value = isObject(o[key]) ? expandKeys(o[key], delimiter) : o[key];
    key
      .toString()
      .split(delimiter)
      .map((k) => k.trim())
      .forEach((k) => (out[k] = value));
  });
  return out;
}

export function isPartialEqual(a: O, b: O): boolean {
  if (typeof a !== typeof b) return false;
  return typeof a === "object"
    ? !keys(a).some((key) => !isPartialEqual(a[key], b[key]))
    : a === b;
}
export function flattenKeys(o: O, path = "", delimiter = ",", out: O = {}) {
  keys(o).forEach((key) =>
    typeof o[key] === "object"
      ? flattenKeys(o[key], path + key + delimiter, delimiter, out)
      : (out[path + key] = o[key])
  );
  return out;
}
