async function redirect() {
  return [
    {
      source: '/',
      destination: '/home',
      permanent: true,
    },
  ]
}

module.exports = redirect
