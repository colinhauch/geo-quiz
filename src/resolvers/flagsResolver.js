/**
 * Picks 3 random distractors from the records that aren't the current record.
 */
function pickDistractors(records, currentRecord, count = 3) {
  const candidates = records.filter(r => r.id !== currentRecord.id)
  const shuffled = candidates.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(r => r.country)
}

/**
 * Resolves flag pack records into normalized question objects.
 */
export function resolveFlagsQuestions(records) {
  return records.map(record => ({
    id: record.id,
    packId: 'flags',
    questionType: 'image-identify',
    questionText: 'Which country does this flag belong to?',
    correctAnswer: record.country,
    distractors: pickDistractors(records, record, 3),
    image: `https://flagcdn.com/w320/${record.isoCode.toLowerCase()}.png`,
    tags: record.tags || [],
    tagGroup: 'political',
    difficulty: record.difficulty || 'easy',
    wikipedia: null,
    source: 'flagcdn.com'
  }))
}
