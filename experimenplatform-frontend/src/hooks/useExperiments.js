import { useState, useEffect, useCallback } from 'react'
import * as experimentsApi from '../api/experiments'

export function useExperiments() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await experimentsApi.getExperiments()
      setExperiments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data) => {
    const newExp = await experimentsApi.createExperiment(data)
    setExperiments((prev) => [newExp, ...prev])
    return newExp
  }

  const remove = async (id) => {
    await experimentsApi.deleteExperiment(id)
    setExperiments((prev) => prev.filter((e) => e.id \!== id))
  }

  const changeStatus = async (id, status) => {
    const updated = await experimentsApi.patchExperimentStatus(id, status)
    setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  return { experiments, loading, error, refetch: fetch, create, remove, changeStatus }
}
