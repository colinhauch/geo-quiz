import { useState, useEffect } from 'react'

const ATTEMPTS_KEY = 'geo-quiz:attempts'
const SESSIONS_KEY = 'geo-quiz:sessions'

/**
 * Hook for managing stats persistence with localStorage.
 */
export function useStats() {
  const [attempts, setAttempts] = useState([])
  const [sessions, setSessions] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem(ATTEMPTS_KEY)
    const storedSessions = localStorage.getItem(SESSIONS_KEY)

    if (storedAttempts) {
      try {
        setAttempts(JSON.parse(storedAttempts))
      } catch (e) {
        console.error('Failed to parse attempts:', e)
      }
    }

    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions))
      } catch (e) {
        console.error('Failed to parse sessions:', e)
      }
    }
  }, [])

  // Save attempts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts))
  }, [attempts])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  }, [sessions])

  const recordAttempt = (attempt) => {
    setAttempts([...attempts, attempt])
  }

  const recordSession = (sessionData) => {
    setSessions([...sessions, { ...sessionData, timestamp: Date.now() }])
  }

  const getTotalAttempts = () => attempts.length

  const getSuccessRate = () => {
    if (attempts.length === 0) return 0
    const correct = attempts.filter(a => a.correct).length
    return (correct / attempts.length) * 100
  }

  const getSuccessRateByTag = (tag) => {
    const tagAttempts = attempts.filter(a => a.tags.includes(tag))
    if (tagAttempts.length === 0) return 0
    const correct = tagAttempts.filter(a => a.correct).length
    return (correct / tagAttempts.length) * 100
  }

  const getSuccessRateByDifficulty = (difficulty) => {
    const diffAttempts = attempts.filter(a => a.difficulty === difficulty)
    if (diffAttempts.length === 0) return 0
    const correct = diffAttempts.filter(a => a.correct).length
    return (correct / diffAttempts.length) * 100
  }

  const getTagBreakdown = () => {
    const tagMap = {}
    attempts.forEach(attempt => {
      attempt.tags.forEach(tag => {
        if (!tagMap[tag]) {
          tagMap[tag] = { attempted: 0, correct: 0 }
        }
        tagMap[tag].attempted++
        if (attempt.correct) tagMap[tag].correct++
      })
    })
    return tagMap
  }

  return {
    attempts,
    sessions,
    recordAttempt,
    recordSession,
    getTotalAttempts,
    getSuccessRate,
    getSuccessRateByTag,
    getSuccessRateByDifficulty,
    getTagBreakdown
  }
}
