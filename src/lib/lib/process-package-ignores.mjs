import { readFile } from 'node:fs/promises'

const processPackageIgnores = async () => {
  const packageContents = await readFile('./package.json', { encoding : 'utf8' })
  const packageJSON = JSON.parse(packageContents)

  return packageJSON.devPkg?.linting?.ignores || []
}

export { processPackageIgnores }
