import api from './client'

export const getEnrollments = (experimentId) =>
  api.get(`/experiments/${experimentId}/enrollments`).then((r) => r.data)

export const getEnrollment = (enrollmentId) =>
  api.get(`/enrollments/${enrollmentId}`).then((r) => r.data)

export const enrollByToken = (token, data) =>
  api.post(`/invite/${token}/enroll`, data).then((r) => r.data)

export const getInviteInfo = (token) =>
  api.get(`/invite/${token}`).then((r) => r.data)

export const patchEnrollmentStatus = (enrollmentId, status) =>
  api.patch(`/enrollments/${enrollmentId}/status`, { status }).then((r) => r.data)
