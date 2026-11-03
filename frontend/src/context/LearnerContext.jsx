import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const LearnerContext = createContext(null)

export function LearnerProvider({ children }) {
  const [learners, setLearners] = useState([])
  const [currentLearner, setCurrentLearner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadLearners = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getLearners()
      setLearners(data)
      if (data.length > 0 && !currentLearner) {
        setCurrentLearner(data[0])
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentLearner])

  const selectLearner = useCallback((learnerId) => {
    const learner = learners.find(l => l.id === learnerId)
    if (learner) {
      setCurrentLearner(learner)
    }
  }, [learners])

  const updateLearner = useCallback((updatedLearner) => {
    setLearners(prev => prev.map(l => l.id === updatedLearner.id ? updatedLearner : l))
    if (currentLearner?.id === updatedLearner.id) {
      setCurrentLearner(updatedLearner)
    }
  }, [currentLearner])

  useEffect(() => {
    loadLearners()
  }, [loadLearners])

  return (
    <LearnerContext.Provider value={{
      learners,
      currentLearner,
      loading,
      error,
      loadLearners,
      selectLearner,
      updateLearner
    }}>
      {children}
    </LearnerContext.Provider>
  )
}

export function useLearnerContext() {
  const context = useContext(LearnerContext)
  if (!context) {
    throw new Error('useLearnerContext must be used within a LearnerProvider')
  }
  return context
}