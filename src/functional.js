export const compose = (...fns) => {
  lastFn = fns.pop()
  return (...p) => fns.reduceRight((pf, f) => f(pf), lastFn(...p))
}
export const trail =
  (f1, ...fns) =>
  (...p) =>
    fns.reduce((pf, f) => f(pf), f1(...p))
export const queue =
  (...fns) =>
  (...p) => {
    const lastFn = fns.pop()
    fns.forEach(f => f(...p))
    return lastFn(...p)
  }
export const beat =
  (...fs) =>
  (...p) =>
    fs.some(f => f(...p))
export const curry =
  (f, ...args) =>
  (...args2) =>
    f(...args, ...args2)
export const aim =
  (f, ...args) =>
  (...args2) =>
    f(...args2, ...args)
export const fork =
  (...fns) =>
  (...p) =>
    fns.map(f => f(...p))
export const guard =
  (f, ...gfns) =>
  (...p) =>
    gfns.every(gf => gf(...p)) && f(...p)
export const exploit =
  (f, ...gfns) =>
  (...p) =>
    gfns.some(gf => gf(...p)) && f(...p)

// ----------------  renaming for better coding ----------------

export const $C = compose
export const $L = trail
export const $I = queue
export const $B = beat
export const $P = curry
export const $X = aim
export const $E = fork
export const $G = guard
export const $T = exploit
