import api from './client'

export const submitResponses = (enrollmentId, data) =>
  api.post(`/enrollments/${enrollmentId}/responses`, data).then((r) => r.data)

export const getExperimentResponses = (experimentId) =>
  api.get(`/experiments/${experimentId}/responses`).then((r) => r.data)

export const getParticipantResponses = (enrollmentId) =>
  api.get(`/enrollments/${enrollmentId}/responses`).then((r) => r.data)
