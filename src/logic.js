import { curry } from "./functional.js"

export const ox = () => {}
export const falsePromise = new Promise(ox)
export const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n)
export const timeout = ms => new Promise(r => setTimeout(r, ms))
export const sleep = timeout

export function err(msg) {
  throw new Error(msg)
}
export function getRandomInt(min = 0, max = 1) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
}
export function debounce(fn, ms = 0) {
  let timeout, args
  const execFn = () => fn(...args)
  return (...p) => {
    args = p
    clearTimeout(timeout)
    timeout = setTimeout(execFn, ms)
  }
}
export function Debouncer(fn) {
  let timeout, args, set, ret
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
    debounce: (...p) => {
      args = p
      clearTimeout(timeout)
      timeout = setTimeout(execFn, 0)
      set()
    },
    exec: ox,
  }
  return ret
}
export const wait = fn => {
  let execFn, waitedFn
  const ready = () => (execFn = start)
  const waiting = (...p) => (waitedFn = curry(start, ...p))
  const start = (execFn = async (...p) => {
    execFn = waiting
    waitedFn = ready
    await fn(...p)
    waitedFn()
  })
  return (...p) => execFn(...p)
}
export const throttle = (fn, ms = 0) =>
  wait((...p) => {
    fn(...p)
    return timeout(ms)
  })
export const shield = (fn, ms = 0) => {
  const start = (...p) => {
    fn(...p)
    execFn = ox
    setTimeout(() => (execFn = start), ms)
  }
  let execFn = start
  return (...p) => execFn(...p)
}

export function factory(setterFunction, o = {}) {
  setterFunction = setterFunction.bind(o)
  return new Proxy(o, {
    get(target, prop) {
      return target[prop] || (target[prop] = setterFunction(prop))
    },
  })
}
export function mapFactory(setterFunction, m = new Map()) {
  setterFunction = setterFunction.bind(m)
  let v
  const f = prop => m.get(prop) || (m.set(prop, (v = setterFunction(prop))), v)
  f.__map = m
  return f
}
export function cacher(setterFunction, m = new Map()) {
  setterFunction = setterFunction.bind(m)
  let v
  function fun(...params) {
    let prop
    try {
      prop = JSON.stringify(params)
    } catch (e) {
      console.warn(e)
      prop = params
    }
    return m.get(prop) || (m.set(prop, (v = setterFunction(...params))) && v)
  }
  fun._map = m
  return fun
}
export const cell =
  (f, m) =>
  (...args) => {
    const ret = f(m, ...args)
    return ret instanceof Promise ? ret.then(v => (m = v)) : (m = ret)
  }
