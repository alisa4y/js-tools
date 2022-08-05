export function replaceMulti(str, rs) {
  return Promise.all(
    rs.reduce(
      (parts, [rgx, callback]) => {
        return parts
          .map(s =>
            typeof s === "string" ? collectReplaceParts(s, rgx, callback) : s
          )
          .flat()
      },
      [str]
    )
  ).then(parts => parts.join(""))
}

export function replaceAsync(str, rgx, callback) {
  return Promise.all(collectReplaceParts(str, rgx, callback)).thes(s =>
    s.join("")
  )
}
function collectReplaceParts(str, rgx, callback) {
  let parts = [],
    i = 0
  if (Object.prototype.toString.call(rgx) == "[object RegExp]") {
    if (rgx.global) rgx.lastIndex = i
    let m
    while ((m = rgx.exec(str))) {
      let args = m.concat([m.index, m.input])
      i !== m.index && parts.push(str.slice(i, m.index))
      parts.push(callback(...args))
      i = rgx.lastIndex
      if (!rgx.global) break // for non-global regexes only take the first match
      if (m[0].length === 0) rgx.lastIndex++
    }
  } else {
    rgx = String(rgx)
    i = str.indexOf(rgx)
    i !== m.index && parts.push(str.slice(i, m.index))
    parts.push(callback(rgx, i, str))
    i += rgx.length
  }
  parts.push(str.slice(i))
  return parts
}
