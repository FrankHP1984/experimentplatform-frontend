import api from './client'

export const getQuestions = (phaseId) =>
  api.get(`/phases/${phaseId}/questions`).then((r) => r.data)

export const createQuestion = (phaseId, data) =>
  api.post(`/phases/${phaseId}/questions`, data).then((r) => r.data)

export const updateQuestion = (phaseId, questionId, data) =>
  api.put(`/phases/${phaseId}/questions/${questionId}`, data).then((r) => r.data)

export const deleteQuestion = (phaseId, questionId) =>
  api.delete(`/phases/${phaseId}/questions/${questionId}`).then((r) => r.data)
