import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const myDirFromImport = (url) => dirname(fileURLToPath(url))

export { myDirFromImport }
