import { useState } from 'react'

/**
 * Hook for managing a quiz session: queue of questions, current index, attempt tracking.
 */
export function useSession() {
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState([])
  const [selectedPackIds, setSelectedPackIds] = useState([])

  const startSession = (questions, packIds) => {
    // Shuffle questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setQueue(shuffled)
    setCurrentIndex(0)
    setAttempts([])
    setSelectedPackIds(packIds)
  }

  const recordAttempt = (questionId, correct) => {
    const currentQuestion = queue[currentIndex]
    if (!currentQuestion) return

    const attempt = {
      questionId: currentQuestion.id,
      packId: currentQuestion.packId,
      tags: currentQuestion.tags,
      tagGroup: currentQuestion.tagGroup,
      difficulty: currentQuestion.difficulty,
      correct,
      timestamp: Date.now()
    }

    setAttempts([...attempts, attempt])
  }

  const nextQuestion = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1)
      return true
    }
    return false
  }

  const currentQuestion = queue[currentIndex]
  const isComplete = currentIndex >= queue.length

  return {
    queue,
    currentIndex,
    currentQuestion,
    isComplete,
    attempts,
    selectedPackIds,
    startSession,
    recordAttempt,
    nextQuestion
  }
}
