import api from './client'

export const fetchMe = () =>
  api.get('/users/me').then((r) => r.data)

export const updateMe = (data) =>
  api.put('/users/me', data).then((r) => r.data)
