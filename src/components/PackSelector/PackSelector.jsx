import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resolveFlagsQuestions } from '../../resolvers/flagsResolver'
import { useSession } from '../../hooks/useSession'

export default function PackSelector() {
  const navigate = useNavigate()
  const { startSession } = useSession()
  const [packs, setPacks] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const response = await fetch('/data/index.json')
        const data = await response.json()
        setPacks(data)
      } catch (err) {
        setError('Failed to load packs')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPacks()
  }, [])

  const togglePack = (packId) => {
    const newSelected = new Set(selected)
    if (newSelected.has(packId)) {
      newSelected.delete(packId)
    } else {
      newSelected.add(packId)
    }
    setSelected(newSelected)
  }

  const handleStartQuiz = async () => {
    if (selected.size === 0) {
      setError('Please select at least one pack')
      return
    }

    try {
      // Load and resolve questions from selected packs
      const allQuestions = []

      for (const packId of selected) {
        if (packId === 'flags') {
          const response = await fetch('/data/packs/flags.json')
          const records = await response.json()
          const questions = resolveFlagsQuestions(records)
          allQuestions.push(...questions)
        }
      }

      // Start session and navigate to quiz
      startSession(allQuestions, Array.from(selected))

      // Store session data in sessionStorage so Quiz can access it
      sessionStorage.setItem('quizSession', JSON.stringify({
        questions: allQuestions,
        packIds: Array.from(selected)
      }))

      navigate('/quiz')
    } catch (err) {
      setError('Failed to start quiz')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading packs...</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Select Quiz Packs</h2>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packs.map(pack => (
          <div
            key={pack.id}
            className={`p-6 border-2 rounded-lg cursor-pointer transition ${
              selected.has(pack.id)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
            onClick={() => togglePack(pack.id)}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selected.has(pack.id)}
                onChange={() => {}}
                className="mt-1 w-5 h-5 text-indigo-600 rounded"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold text-gray-800">{pack.name}</h3>
                <p className="text-gray-600 mt-1">{pack.description}</p>
                <div className="mt-3 flex gap-3 text-sm text-gray-500">
                  <span>{pack.questionCount} questions</span>
                  <span>•</span>
                  <span className="capitalize">{pack.difficulty}</span>
                  {pack.imageRequired && (
                    <>
                      <span>•</span>
                      <span>Images</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleStartQuiz}
        disabled={selected.size === 0}
        className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        Start Quiz ({selected.size} pack{selected.size !== 1 ? 's' : ''} selected)
      </button>
    </div>
  )
}
