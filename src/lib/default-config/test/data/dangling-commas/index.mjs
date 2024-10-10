import {
  getEslintConfig // should have comma
} from '../../../eslint-config'

// we expect dangling commas in data structures
const bar = {
  bar : 'blah' // should have comma!
}

const baz = [
  1 // should have comma!
]

const bing = (
  bong // should have comma
) => {
  return bong
}

baz(
  'blah' // should have comma
)

export { // export stuff to avoid unused var error
  getEslintConfig,
  bar,
  baz,
  bing // should have comma
}
