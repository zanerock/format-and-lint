const msg = 'Hi!'

const bootstrap = () => msg.replace(new RegExp('.*'), 'refex preferred')

export { bootstrap }
