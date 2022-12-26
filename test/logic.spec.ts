import { describe, it } from "mocha"
import * as chai from "chai"
import {
  ox,
  falsePromise,
  isNumber,
  timeout,
  sleep,
  getRandomInt,
  debounce,
  Debouncer,
  wait,
  throttle,
  shield,
  factory,
  mapFactory,
  cacher,
  cell,
} from "../src/logic"

chai.should()
const { expect } = chai

type Eq<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false

type Expect<T extends true> = T

describe("ox", () => {
  it("is empty function useful for some logic", () => {
    type check = [Expect<Eq<() => void, typeof ox>>]
    expect(ox()).equal(undefined)
  })
})
describe("falsePromise", () => {
  it("returns a promise which never returns as its name saying false promise :)", () => {
    type check = [Expect<Eq<typeof falsePromise, Promise<unknown>>>]
    falsePromise.then(() => {
      throw new Error("shouldn't called")
    })
  })
})
describe("isNumber", () => {
  it("simply checks is it a number)", () => {
    type check = [Expect<Eq<typeof isNumber, (x: any) => boolean>>]
    isNumber("hello").should.equal(false)
    isNumber("2").should.equal(false)
    isNumber("242").should.equal(false)
    isNumber(undefined).should.equal(false)
    isNumber(null).should.equal(false)
    isNumber({}).should.equal(false)
    isNumber([]).should.equal(false)
    isNumber(10).should.equal(true)
    isNumber(5).should.equal(true)
  })
})
describe("timeout", () => {
  it("promise type of setTimout", done => {
    type check = [Expect<Eq<typeof timeout, (x: number) => Promise<unknown>>>]
    timeout(100).then(done)
  })
})
describe("sleep", () => {
  it("alise for timeout", done => {
    type check = [Expect<Eq<typeof sleep, (x: number) => Promise<unknown>>>]
    sleep(100).then(done)
  })
})
describe("getRandomInt", () => {
  it("generates a random Int in given range (min, max)", () => {
    type check = [
      Expect<Eq<typeof getRandomInt, (x?: number, y?: number) => number>>
    ]
    getRandomInt(3, 7).should.be.lessThanOrEqual(7).and.greaterThanOrEqual(3)
    getRandomInt(13, 127).should.be.lessThan(128).and.greaterThan(12)
  })
})
type Fn = (...a: any[]) => any
describe("debounce", () => {
  it("it delayes an execute of function after certain time", async () => {
    type check = [
      Expect<
        Eq<
          typeof debounce,
          <T extends Fn>(fn: T, ms?: number) => (...p: Parameters<T>) => void
        >
      >
    ]
    let x = 0
    debounce(() => (x = 10), 10)()
    x.should.equal(0)
    await timeout(20)
    x.should.equal(10)
  })
  it("can do multiple debounce", async () => {
    let x = 0
    const d = debounce(() => (x = 10), 100)
    d()
    x.should.equal(0)
    await timeout(60)
    d()
    await timeout(50)
    x.should.equal(0)
    await timeout(70)
    x.should.equal(10)
  })
})
describe("Debouncer", () => {
  it("works like debounce which gives you a control to execute the function any time or wait for it to get called", async () => {
    type check = [
      Expect<
        Eq<
          typeof Debouncer,
          <T extends Fn>(
            fn: T,
            ms?: number
          ) => {
            debounce: (...p: Parameters<T>) => void
            exec: () => void
            setAwaitTime: (x: number) => void
          }
        >
      >
    ]
    let x = 0
    const d = Debouncer(() => (x = 10), 100)
    d.debounce()
    x.should.equal(0)
    await timeout(50)
    x.should.equal(0)
    d.exec()
    x.should.equal(10)
  })
})
describe("wait", () => {
  it("waits for async function to complete then executes the next call (the calls in waited time will just save arguments)", async () => {
    type check = [
      Expect<
        Eq<
          typeof wait,
          <T extends Fn>(fn: T) => (...args: Parameters<T>) => Promise<void>
        >
      >
    ]
    let x = 0
    const changeX = async () => {
      await timeout(50)
      x++
    }
    const waitChange = wait(changeX)
    x.should.equal(0)
    await waitChange()
    x.should.equal(1)
    await waitChange()
    x.should.equal(2)
    waitChange()
    waitChange()
    waitChange()
    waitChange()
    await waitChange()
    x.should.equal(3)
    await timeout(55)
    x.should.equal(4)
    waitChange()
    waitChange()
    await timeout(55)
    x.should.equal(5)
  })
})
describe("throttle", () => {
  it("throttle execution of asynchronus function calls", async () => {
    type check = [
      Expect<
        Eq<
          typeof throttle,
          <T extends Fn>(
            fn: T,
            ms: number
          ) => (...args: Parameters<T>) => Promise<void>
        >
      >
    ]
    let x = 0
    const xChanger = () => x++
    const throttleXChanger = throttle(xChanger, 50)
    throttleXChanger()
    throttleXChanger()
    throttleXChanger()
    x.should.equal(1)

    throttleXChanger()
    throttleXChanger()
    throttleXChanger()
    await timeout(150)
    x.should.equal(2)

    throttleXChanger()
    throttleXChanger()
    throttleXChanger()
    x.should.equal(3)

    throttleXChanger()
    throttleXChanger()
    await throttleXChanger()
    x.should.equal(4)

    throttleXChanger()
    throttleXChanger()
    await timeout(155)
    x.should.equal(5)

    throttleXChanger()
    throttleXChanger()
    await throttleXChanger()
    await timeout(150)
    // will execute twice 1st for the 1st call 2nd for latelst callso
    x.should.equal(7)
  })
})
describe("sheild", () => {
  it("takes a function and a time in milisecond that wait for time to end to execute the function again", async () => {
    type check = [
      Expect<
        Eq<
          typeof shield,
          <T extends Fn>(fn: T, ms: number) => (...args: Parameters<T>) => void
        >
      >
    ]
    let x = 0
    const changeX = () => x++
    const shieldedChanger = shield(changeX, 50)
    shieldedChanger()
    shieldedChanger()
    shieldedChanger()
    shieldedChanger()
    x.should.equal(1)
    await timeout(90)
    shieldedChanger()
    shieldedChanger()
    shieldedChanger()
    shieldedChanger()
    x.should.equal(2)
  })
})
describe("factory", () => {
  it("is a proxy which when gets an undefined or null value will call the setter ", () => {
    let executed = 0
    const setter = (x: any) => {
      executed++
      return "got: " + x
    }
    const fac = factory(setter)
    fac[1].should.equal("got: 1")
    executed.should.equal(1)
    fac[1].should.equal("got: 1")
    fac[1].should.equal("got: 1")
    fac[1].should.equal("got: 1")
    executed.should.equal(1)
    fac["hello"].should.equal("got: hello")
    executed.should.equal(2)
    fac["hello"].should.equal("got: hello")
    fac["hello"].should.equal("got: hello")
    fac["hello"].should.equal("got: hello")
    executed.should.equal(2)
  })
})
describe("mapFactory", () => {
  it("is like factory but uses map object as core and can take anything as argument", () => {
    let executed = 0
    const setter = (x: any) => {
      executed++
      return x
    }
    const fac = mapFactory(setter)
    const o = {}
    fac(o).should.equal(o)
    fac(o).should.equal(o)
    fac(o).should.equal(o)
    fac(1).should.equal(1)
    fac(1).should.equal(1)
    fac("hello").should.equal("hello")
    fac("hello").should.equal("hello")
    executed.should.equal(3)

    expect(fac(null)).equal(null)
    expect(fac(null)).equal(null)
    expect(fac(null)).equal(null)
    executed.should.equal(6)
  })
})
async function calcTime(fn: Fn) {
  let startTime = Date.now()
  const result = await fn()
  let endTime = Date.now()
  return { duration: endTime - startTime, result }
}
describe("cacher", () => {
  it("caches the result of a function and won't execute it any more with that args", async () => {
    const add = async (x: number, y: number) => {
      await timeout(150)
      return x + y
    }
    const cacheAdd = cacher(add)
    await calcTime(() => cacheAdd(2, 4)).then(({ duration, result }) => {
      expect(duration).greaterThanOrEqual(150)
      result.should.equal(6)
    })
    await calcTime(() => cacheAdd(2, 4)).then(({ duration, result }) => {
      expect(duration).lessThan(20)
      result.should.equal(6)
    })
  })
})
describe("cell", () => {
  it("takes a function and call it with its last result", () => {
    const counter = cell((x: number) => x + 1, 0)
    counter().should.equal(1)
    counter().should.equal(2)
    counter().should.equal(3)
    const addToLast = cell((n1: number, n2: number) => n1 + n2, 0)
    addToLast(10).should.equal(10)
    addToLast(2).should.equal(12)
    addToLast(5).should.equal(17)
  })
})
