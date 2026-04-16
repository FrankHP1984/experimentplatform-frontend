import { useState, useEffect, useCallback } from 'react'
import * as experimentsApi from '../api/experiments'

export function useExperiments() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await experimentsApi.getMyExperiments()
      // Backend devuelve Page<ExperimentDTO>, extraemos content
      const experiments = data.content || data
      
      // Enriquecer cada experimento con contadores
      const enriched = await Promise.all(
        experiments.map(async (exp) => {
          try {
            const [participants, responses, phases] = await Promise.all([
              experimentsApi.getExperimentParticipants(exp.id).catch(() => ({ content: [] })),
              experimentsApi.getExperimentResponses(exp.id).catch(() => []),
              experimentsApi.getExperimentPhases(exp.id).catch(() => [])
            ])
            
            // Contar preguntas en todas las fases
            const questionCount = phases.reduce((sum, phase) => sum + (phase.questionCount || 0), 0)
            
            return {
              ...exp,
              design: exp.designType, // Mapear designType a design
              participantCount: participants.content?.length || participants.length || 0,
              responseCount: responses.length || 0,
              phaseCount: phases.length || 0,
              questionCount
            }
          } catch {
            // Si falla, devolver experimento sin contadores
            return {
              ...exp,
              participantCount: 0,
              responseCount: 0,
              phaseCount: 0,
              questionCount: 0
            }
          }
        })
      )
      
      setExperiments(enriched)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data) => {
    // Mapear design a designType para el backend
    const payload = {
      ...data,
      designType: data.design,
      design: undefined
    }
    const newExp = await experimentsApi.createExperiment(payload)
    // Agregar contadores iniciales
    const enrichedExp = {
      ...newExp,
      design: newExp.designType,
      participantCount: 0,
      responseCount: 0,
      phaseCount: 0,
      questionCount: 0
    }
    setExperiments((prev) => [enrichedExp, ...prev])
    return enrichedExp
  }

  const remove = async (id) => {
    await experimentsApi.deleteExperiment(id)
    setExperiments((prev) => prev.filter((e) => e.id !== id))
  }

  const changeStatus = async (id, status) => {
    const updated = await experimentsApi.patchExperimentStatus(id, status)
    setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  return { experiments, loading, error, refetch: fetch, create, remove, changeStatus }
}
