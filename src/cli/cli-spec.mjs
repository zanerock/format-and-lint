import { BooleanString } from 'string-input'

const lintArgs = [
  { name: 'files', multiple: true, description: "A file patterns selecting target files to process. If neither this nor '--files-paths' is specified, then standard, predefined patterns will be used." },
  { name: 'files-paths', multiple: true, description: "A path to a file containing newline separated file patterns selecting files to process. If neither this nor '--files' is specified, then standard, predefined patterns will be used."},
  { name: 'ignore-files', multiple: true, description: 'A file pattern selecting files to ignore.'},
  { name: 'ignore-files-paths', multiple: true, description: 'A path to a file containing a list of newline separated file patterns selecting files to ignore.'},
  { name: 'eslint-config-path', description: 'Specifies the path to a eslint configuration file to replace the default base eslint configuration.'},
  { name: 'eslint-config-components-path', description: "Specifies the path to a configuration file that resolves to an object keyed to 'base', 'jsx', 'node', and 'test' configuration components." },
  { name: 'ignore-package-settings', type: Boolean, description: "Suppresses merging settings from 'package.json:devPkg.linting'."},
  { name: 'no-standard-ignores', type: Boolean, description: "Suppresses default .gitignore and '**/test/data/**/*' ignore patterns." },
]

const cliSpec = {
  mainCommand: 'fandl',
  description: 'Optimized, single command out of the box JavaScript format and lint tool.',
  arguments: [
    { name: 'command', defaultOption: true, default: 'format-and-lint', description: 'The action to perform.' },
  ],
  commands: [
    { 
      name: 'format-and-lint',
      description: 'Formats and runs lint checks on the target files.',
      arguments: [
        ...lintArgs,
        { 
          name: 'prettier-config-path',
          description: 'Specifies the path to a prettier configuration file to replace the default configuration as the base prettier configuration.'
        }
      ]
    },
    { name: 'lint', descirption: 'Runs lint checks on the target files.', arguments: lintArgs },
    /*{ name: 'show-eslint-config', description: 'Prints the effective eslint configuration to stdout.', arguments: globalArguments },
    { name: 'show-prettier-config', description: 'Prints the effective prettier configuration to stdout.', arguments: globalArguments },*/
    { 
      name: 'help', description: 'Prints the command help.', 
      arguments: [{ name: 'command', defaultOption: true, description: 'Optional command specific help.' }]
    },
    { name: 'version', description: 'Prints the tool version.' },
  ]
}

export { cliSpec }