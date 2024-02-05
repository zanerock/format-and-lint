const msg = 'Hi!'

const bootstrap = () => msg.replace(new RegExp('.*'), 'regex preferred')

export { bootstrap }
