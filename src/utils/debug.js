import _debug from 'debug'

function log(namespace, ...messages) {
  const debug = _debug(namespace)
  messages.forEach((m) => debug(m))
}

export default {
  log,
}
