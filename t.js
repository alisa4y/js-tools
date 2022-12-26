const curry =
  (f, ...args) =>
  (...args2) =>
    f(...args, ...args2)
const wait = fn => {
  let execFn, waitedFn, promise
  const ready = () => (execFn = start)
  const waiting = (...p) => {
    console.log("change waitedFn to curry")
    waitedFn = curry(start, ...p)
    // return promise
  }
  const start = async (...p) => {
    execFn = waiting
    console.log("change waitedFn to ready")

    waitedFn = ready
    promise = fn(...p)
    await promise
    console.log("execute waitedFn")
    waitedFn()
  }
  execFn = start
  return (...p) => {
    // console.log("execFn: " + execFn.toString())
    return execFn(...p)
  }
}
const timeout = ms =>
  new Promise(res => {
    setTimeout(res, ms)
  })

async function main() {
  let x = 0
  const changeX = async () => {
    await timeout(50)
    // console.log("executed")
    x++
  }
  const waitChange = wait(changeX)
  await waitChange()
  console.log(x)
  waitChange()
  waitChange()
  waitChange()
  await timeout(200)
  console.log(x) // 2
  await waitChange()
  // await timeout(105)
  console.log(x) // 3
  // waitChange()
  // waitChange()
  // waitChange()
  // await timeout(105)
  // console.log(x)
}
main()
