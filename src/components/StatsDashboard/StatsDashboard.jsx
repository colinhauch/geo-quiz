import { useNavigate } from 'react-router-dom'
import { useStats } from '../../hooks/useStats'
import { useEffect, useState } from 'react'

export default function StatsDashboard() {
  const navigate = useNavigate()
  const stats = useStats()
  const [tagBreakdown, setTagBreakdown] = useState({})

  useEffect(() => {
    setTagBreakdown(stats.getTagBreakdown())
  }, [stats.attempts])

  const totalAttempts = stats.getTotalAttempts()
  const successRate = stats.getSuccessRate()
  const easyRate = stats.getSuccessRateByDifficulty('easy')
  const mediumRate = stats.getSuccessRateByDifficulty('medium')
  const hardRate = stats.getSuccessRateByDifficulty('hard')

  const sortedTags = Object.entries(tagBreakdown)
    .sort((a, b) => b[1].attempted - a[1].attempted)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quiz Statistics</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          Take Another Quiz
        </button>
      </div>

      {totalAttempts === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No quiz attempts yet. Start a quiz to see your stats!</p>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Total Attempted</p>
              <p className="text-4xl font-bold text-indigo-600 mt-2">{totalAttempts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Success Rate</p>
              <p className="text-4xl font-bold text-indigo-600 mt-2">{successRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Correct Answers</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {stats.attempts.filter(a => a.correct).length}/{totalAttempts}
              </p>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance by Difficulty</h3>
            <div className="space-y-4">
              {easyRate > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">Easy</span>
                    <span className="text-gray-600">{easyRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${easyRate}%` }}
                    />
                  </div>
                </div>
              )}
              {mediumRate > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">Medium</span>
                    <span className="text-gray-600">{mediumRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${mediumRate}%` }}
                    />
                  </div>
                </div>
              )}
              {hardRate > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">Hard</span>
                    <span className="text-gray-600">{hardRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${hardRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tag Breakdown */}
          {sortedTags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance by Tag</h3>
              <div className="space-y-3">
                {sortedTags.map(([tag, data]) => {
                  const rate = (data.correct / data.attempted) * 100
                  return (
                    <div key={tag}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700 capitalize">{tag}</span>
                        <span className="text-sm text-gray-600">
                          {data.correct}/{data.attempted} ({rate.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
