import { useMemo } from 'react'

export default function QuizQuestion({
  question,
  answered,
  selectedAnswer,
  isCorrect,
  onAnswer
}) {
  // Memoize options so they don't reshuffle on re-render
  const options = useMemo(() => {
    return [question.correctAnswer, ...question.distractors].sort(() => Math.random() - 0.5)
  }, [question.id])

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <p className="text-gray-600 text-lg mb-6">{question.questionText}</p>

      {question.image && (
        <div className="mb-8 flex justify-center">
          <img
            src={question.image}
            alt="Question"
            className="max-h-64 rounded-lg shadow"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<p class="text-red-500">Image failed to load</p>'
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {options.map((option, idx) => {
          const isSelected = option === selectedAnswer
          const isCorrectAnswer = option === question.correctAnswer

          let buttonClass = 'p-4 text-left border-2 rounded-lg font-medium transition '

          if (!answered) {
            buttonClass += 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
          } else {
            if (isCorrectAnswer) {
              buttonClass += 'border-green-500 bg-green-50 text-green-700'
            } else if (isSelected && !isCorrect) {
              buttonClass += 'border-red-500 bg-red-50 text-red-700'
            } else {
              buttonClass += 'border-gray-200 text-gray-400'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onAnswer(option)}
              disabled={answered}
              className={buttonClass}
            >
              <span className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 border rounded mr-3 text-sm">
                  {answered && isCorrectAnswer && '✓'}
                  {answered && isSelected && !isCorrect && '✗'}
                  {!answered && (String.fromCharCode(65 + idx))}
                </span>
                {option}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
