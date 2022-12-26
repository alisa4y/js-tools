import { curry } from "./functional"

export const ox = () => {}
export const falsePromise = new Promise(ox)
export const isNumber = (n: any): boolean =>
  typeof n === "number" && !isNaN(n) && isFinite(n)
export const timeout = (ms: number) => new Promise(r => setTimeout(r, ms))
export const sleep = timeout

export function err(msg: string) {
  throw new Error(msg)
}
export function getRandomInt(min = 0, max = 1) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
}
type Fn = (...args: any[]) => any
export function debounce<T extends Fn>(fn: T, ms = 0) {
  let timeout: ReturnType<typeof setTimeout>, args: Parameters<T>
  const execFn = () => fn(...args)
  return (...p: Parameters<T>) => {
    args = p
    clearTimeout(timeout)
    timeout = setTimeout(execFn, ms)
  }
}
interface IDebouncer<T extends Fn> {
  debounce: (...p: Parameters<T>) => void
  exec: () => void
  setAwaitTime: (x: number) => void
}
export function Debouncer<T extends Fn>(fn: T, ms = 0) {
  let timeout: ReturnType<typeof setTimeout>,
    args: Parameters<T>,
    set: Fn,
    ret: IDebouncer<T>
  const execFn = () => fn(...args)
  const setExec = () => {
    ret.exec = () => {
      clearTimeout(timeout)
      fn(...args)
      set = setExec
      ret.exec = ox
    }
    set = ox
  }
  set = setExec
  ret = {
    debounce: (...p: Parameters<T>) => {
      args = p
      clearTimeout(timeout)
      timeout = setTimeout(execFn, ms)
      set()
    },
    exec: ox,
    setAwaitTime: (x: number) => (ms = x),
  }
  return ret
}
export const wait = <T extends Fn>(fn: T) => {
  let execFn: Fn, waitedFn: Fn, promise: Promise<void>
  const ready = () => (execFn = start)
  const waiting = (...p: Parameters<T>) => {
    waitedFn = curry(start, ...p)
    return promise
  }
  const start = (execFn = async (...p) => {
    execFn = waiting
    waitedFn = ready
    promise = fn(...p)
    await promise
    waitedFn()
  })
  return (...p: Parameters<T>) => execFn(...p) as Promise<void>
}
export const throttle = <T extends Fn>(fn: T, ms: number) =>
  wait((...p: Parameters<T>) => {
    fn(...p)
    return timeout(ms)
  })
export const shield = <T extends Fn>(fn: T, ms: number) => {
  const start = (...p: Parameters<T>) => {
    fn(...p)
    execFn = ox
    setTimeout(() => (execFn = start), ms)
  }
  let execFn = start
  return (...p: Parameters<T>) => execFn(...p)
}
type Key = string | number | symbol
export function factory<T extends (arg: Key) => any>(
  setterFunction: T,
  o: Record<Key, ReturnType<T>> = {}
) {
  setterFunction = setterFunction.bind(o)
  return new Proxy(o, {
    get(target, prop: Key) {
      return target[prop] ?? (target[prop] = setterFunction(prop))
    },
  })
}
export function mapFactory<T extends Fn>(setterFunction: T, m = new Map()) {
  setterFunction = setterFunction.bind(m)
  let v
  const f = (prop: Parameters<T>[0]): ReturnType<T> =>
    m.get(prop) ?? (m.set(prop, (v = setterFunction(prop))), v)
  f.__map = m
  return f
}
export function cacher<T extends Fn>(f: T, m = new Map()) {
  f = f.bind(m)
  let v
  function fun(...params: Parameters<T>): ReturnType<T> {
    let prop
    try {
      prop = JSON.stringify(params)
    } catch (e) {
      console.warn(e)
      prop = params
    }
    return m.has(prop) ? m.get(prop) : m.set(prop, (v = f(...params))) && v
  }
  fun._map = m
  return fun
}
type RemoveLast<T extends any[]> = T extends [...infer ts, infer t]
  ? [...ts]
  : []
export const cell =
  <T extends Fn>(f: T, m: ReturnType<T>) =>
  (...args: RemoveLast<Parameters<T>>) => {
    const ret = f(m, ...args)
    return ret instanceof Promise ? ret.then(v => (m = v)) : (m = ret)
  }
