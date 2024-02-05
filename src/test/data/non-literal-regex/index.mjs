/**
 * @file This is a test file demonstraiting the 'prefer-regex-literal' rule.
 */
const msg = 'Hi!'

const bootstrap = () => msg.replace(new RegExp('.*'), 'regex preferred')

export { bootstrap }
