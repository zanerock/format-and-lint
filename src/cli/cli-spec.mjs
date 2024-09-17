import { BooleanString } from 'string-input'
-
const globalArguments = [
  { name: 'files', multiple: true, description: "A file patterns selecting target files to process. If neither this nor '--files-paths' is specified, then standard, predefined patterns will be used." },
  { name: 'files-paths', multiple: true, description: "A path to a file containing newline separated file patterns selecting files to process. If neither this nor '--files' is specified, then standard, predefined patterns will be used."},
  { name: 'ignore-files', multiple: true, description: 'A file pattern selecting files to ignore.'},
  { name: 'ignore-files-paths', multiple: true, description: 'A path to a file containing a list of newline separated file patterns selecting files to ignore.'},
  /*{ name: 'eslint-config-merge', description: 'Specifies the path to an eslint configuration file to be merged with the effective base eslint configuration.' },
  { name: 'eslint-config-base', descirption: 'Specifies the path to an eslint configuration file to replace the default configuration as the base eslint configuration.'},
  { name: 'ignore-package-settings', type: Boolean, description: "Suppresses merging settings from 'package.json:devPkg.linting'."},*/
  { name: 'no-standard-ignores', type: Boolean, description: "Suppresses default .gitignore and '**/test/data/**/*' ignore patterns." },
  /*{ name: 'prettier-config-merge', description: 'Specifies the path to a prettier configuration file to be merged with the effective base prettier configuration' },
  { name: 'prettier-config-base', description: 'Specifies the path to a prettier configuration file to replace the default configuration as the base prettier configuration.' },*/
]

const cliSpec = {
  mainCommand: 'fandl',
  description: 'Optimized, single command out of the box JavaScript format and lint tool.',
  arguments: [
    { name: 'command', defaultOption: true, default: 'format-and-lint', description: 'The action to perform.' },
    ...globalArguments,
  ],
  commands: [
    { name: 'format-and-lint', description: 'Formats and runs lint checks on the target files.', arguments: globalArguments },
    { name: 'lint' descirption: 'Runs lint checks on the target files.', arguments: globalArguments },
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