import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStats } from '../../hooks/useStats'
import QuizQuestion from './QuizQuestion'

export default function Quiz() {
  const navigate = useNavigate()
  const { recordSession } = useStats()
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionAttempts, setSessionAttempts] = useState([])
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackIds, setSelectedPackIds] = useState([])

  // Load session from sessionStorage
  useEffect(() => {
    const sessionData = sessionStorage.getItem('quizSession')
    if (!sessionData) {
      navigate('/')
      return
    }

    try {
      const { questions, packIds } = JSON.parse(sessionData)
      if (!questions || questions.length === 0) {
        navigate('/')
        return
      }
      setQueue(questions)
      setSelectedPackIds(packIds)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load session:', err)
      navigate('/')
    }
  }, [navigate])

  const currentQuestion = queue[currentIndex]

  const handleAnswer = (answer) => {
    if (answered || !currentQuestion) return

    const correct = answer === currentQuestion.correctAnswer
    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setAnswered(true)

    const attempt = {
      questionId: currentQuestion.id,
      packId: currentQuestion.packId,
      tags: currentQuestion.tags,
      tagGroup: currentQuestion.tagGroup,
      difficulty: currentQuestion.difficulty,
      correct,
      timestamp: Date.now()
    }

    setSessionAttempts([...sessionAttempts, attempt])
  }

  const handleNext = () => {
    if (currentIndex === queue.length - 1) {
      // Quiz complete
      const sessionData = {
        packIds: selectedPackIds,
        totalQuestions: queue.length,
        correctAnswers: sessionAttempts.filter(a => a.correct).length,
        attempts: sessionAttempts
      }
      recordSession(sessionData)
      sessionStorage.removeItem('quizSession')
      navigate('/stats')
    } else {
      setCurrentIndex(currentIndex + 1)
      setAnswered(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }
  }

  if (loading || !currentQuestion) {
    return (
      <div className="text-center py-8">
        <p>Loading quiz...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {queue.length}</span>
          <span>{Math.round((currentIndex / queue.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / queue.length) * 100}%` }}
          />
        </div>
      </div>

      <QuizQuestion
        question={currentQuestion}
        answered={answered}
        selectedAnswer={selectedAnswer}
        isCorrect={isCorrect}
        onAnswer={handleAnswer}
      />

      {answered && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg mb-4 ${
            isCorrect
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <p className="font-semibold">
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {!isCorrect && (
              <p className="mt-1">The correct answer is: <span className="font-semibold">{currentQuestion.correctAnswer}</span></p>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            {currentIndex === queue.length - 1 ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  )
}
