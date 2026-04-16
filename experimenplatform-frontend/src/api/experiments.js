import api from './client'

export const getExperiments = () =>
  api.get('/experiments').then((r) => r.data)

export const createExperiment = (data) =>
  api.post('/experiments', data).then((r) => r.data)

export const getExperiment = (id) =>
  api.get(`/experiments/${id}`).then((r) => r.data)

export const updateExperiment = (id, data) =>
  api.put(`/experiments/${id}`, data).then((r) => r.data)

export const deleteExperiment = (id) =>
  api.delete(`/experiments/${id}`).then((r) => r.data)

export const patchExperimentStatus = (id, status) =>
  api.patch(`/experiments/${id}/status`, { status }).then((r) => r.data)
