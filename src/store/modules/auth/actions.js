let timer;

export default {
  async login(context, payload) {
    return context.dispatch('fetchToken', { ...payload, action: 'signInWithPassword' })
  },
  async signup(context, payload) {
    return context.dispatch('fetchToken', { ...payload, action: 'signUp' })
  },
  async fetchToken(context, payload) {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${payload.action}?key=AIzaSyCg9CIpsM_RxMhD4I4JWYrXvtjD26hTbAs`, {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        returnSecureToken: true
      })
    })

    if (!res.ok) throw new Error(res.message || 'Failed to authenticate')

    const data = await res.json()

    const expiresIn = +data.expiresIn * 1000
    // const expiresIn = 5000
    const expirationDate = new Date().getTime() + expiresIn
    localStorage.setItem('tokenExpiration', expirationDate)

    localStorage.setItem('token', data.idToken)
    localStorage.setItem('userId', data.localId)

    timer = setTimeout(function() {
      // context.dispatch('logout')
      context.dispatch('autoLogout')
    }, expiresIn)

    context.commit('setUser', {
      token: data.idToken,
      userId: data.localId,
    })
  },
  logout(context) {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('tokenExpiration')

    clearTimeout(timer)

    context.commit('setUser', {
      token: null,
      userId: null,
    })
  },
  autoLogout(context) {
    context.dispatch('logout')
    context.commit('setAutoLogout')
  },
  tryLogin(context) {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const tokenExpiration = localStorage.getItem('tokenExpiration')

    const expiresIn = +tokenExpiration - new Date().getTime()

    if (expiresIn < 0) return

    timer = setTimeout(function() {
      // context.dispatch('logout')
      context.dispatch('autoLogout')
    }, expiresIn)

    if (token && userId) {
      context.commit('setUser', { token, userId, tokenExpiration: null })
    }
  }
}

