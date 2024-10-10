import { readFileSync } from 'node:fs'

const packageContents = readFileSync('./package.json', { encoding : 'utf8' })
const packageJSON = JSON.parse(packageContents)
const {
  dependencies = {},
  devDependencies = {},
  engines = { node : true },
  pkgdev = {},
} = packageJSON

// Our default 'module' is different than the node interpretation, which defaults to 'commonjs', because there node is
// talking about the final 'dist' output, and here we are talking about the source input.
const sourceType =
  pkgdev['format-and-lint']?.sourceType || packageJSON.type || 'module'

const usesReact =
  dependencies.react !== undefined || devDependencies.react !== undefined
const reactSettings = usesReact ? { version : 'detect' } : {}

export { engines, reactSettings, sourceType, usesReact }
