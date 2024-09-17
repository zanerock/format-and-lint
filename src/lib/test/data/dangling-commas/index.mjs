// we expect dangling commas in data structures
const foo = {
  bar : 'blah' // should have comma!
}

const bar = [
  1 // should have comma!
]

// but not function decls
const baz = (bar) => {
  return bar
}

// or calls
baz('blah')

export {
  foo,
  bar // should NOT have comma
}
