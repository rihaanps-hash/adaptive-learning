import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'
import { api } from '../lib/api'

export default function QuizPage() {
  const { learnerId, conceptId } = useParams()
  const { currentLearner, updateLearner } = useLearnerContext()
  const navigate = useNavigate()

  const learner = currentLearner?.id === learnerId ? currentLearner : null

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState([])
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/quiz/${conceptId}`)
        if (!response.ok) throw new Error('Failed to load questions')
        const data = await response.json()
        setQuestions(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (learner) {
      fetchQuestions()
    }
  }, [conceptId, learner])

  const concept = questions[0] ? questions[0].concept_id : conceptId
  const conceptName = concept.replace('concept-', 'Concept ')

  const handleAnswer = (questionId, selectedIndex) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: selectedIndex }))
  }

  const handleNext = () => {
    const question = questions[currentQuestion]
    if (answers[question.id] === undefined) {
      alert('Please select an answer before continuing.')
      return
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitted(true)
    const results = []
    
    for (const q of questions) {
      const selected = answers[q.id]
      const isCorrect = selected === q.correct_answer
      results.push({
        question_id: q.id,
        concept_id: q.concept_id,
        correct: isCorrect,
        explanation: q.explanation,
        selected,
        correct_answer: q.correct_answer
      })
    }
    
    setResults(results)
    
    try {
      const data = await api.submitQuiz(learnerId, Object.entries(answers).map(([question_id, selected_answer]) => ({
        question_id,
        selected_answer
      })))
      updateLearner({ ...learner, concept_mastery: data.updated_mastery, quiz_history: [...(learner.quiz_history || []), ...data.results] })
      setCompleted(true)
    } catch (err) {
      alert('Error submitting quiz: ' + err.message)
      setSubmitted(false)
    }
  }

  const handleContinue = () => {
    navigate(`/learner/${learnerId}/lesson/lesson-1`)
  }

  const handleRetake = () => {
    setAnswers({})
    setSubmitted(false)
    setResults([])
    setCompleted(false)
    setCurrentQuestion(0)
  }

  if (!learner) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Learner profile not found.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading" role="status" aria-label="Loading quiz">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading practice questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Error loading quiz: {error}</p>
        <button className="btn btn-primary" style={{marginTop: 'var(--spacing-md)'}} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon" aria-hidden="true">❓</div>
        <h2>No questions available</h2>
        <p>No practice questions found for this concept.</p>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (completed) {
    const correctCount = results.filter(r => r.correct).length
    return (
      <div>
        <section aria-labelledby="complete-title">
          <h1 id="complete-title" className="page-title">Practice Complete!</h1>
          <p className="page-subtitle">
            {conceptName} — You answered {correctCount} out of {questions.length} questions correctly.
          </p>
        </section>

        <section aria-labelledby="results-title" className="section">
          <h2 id="results-title" className="section-title">Results</h2>
          <div className="grid grid-2">
            {results.map((result, i) => (
              <article key={result.question_id} className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)'}}>
                  <h3 className="card-title" style={{marginBottom: 0, fontSize: 'var(--font-size-lg)'}}>
                    Question {i + 1}
                  </h3>
                  <span className={result.correct ? 'badge badge-secondary' : 'badge badge-danger'}>
                    {result.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="form-hint">{result.explanation}</p>
              </article>
            ))}
          </div>
        </section>

        <div style={{display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', marginTop: 'var(--spacing-xl)', flexWrap: 'wrap'}}>
          <button className="btn btn-primary" onClick={handleContinue} style={{minWidth: '200px'}}>
            Back to Lesson
          </button>
          <button className="btn btn-outline" onClick={handleRetake} style={{minWidth: '200px'}}>
            Retry Practice
          </button>
          <button className="btn btn-outline" onClick={() => navigate(`/learner/${learnerId}`)} style={{minWidth: '200px'}}>
            Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section aria-labelledby="quiz-title">
        <h1 id="quiz-title" className="page-title">Practice: {conceptName}</h1>
        <p className="page-subtitle">Test your understanding with these practice questions.</p>
      </section>

      <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress" style={{marginBottom: 'var(--spacing-lg)'}}>
        <div className="progress-fill" style={{width: `${progress}%`}}></div>
      </div>
      <p style={{textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)'}}>
        Question {currentQuestion + 1} of {questions.length}
      </p>

      <article className="quiz-question" aria-labelledby={`question-${question.id}`}>
        <h2 id={`question-${question.id}`} className="quiz-question-text">
          {question.question}
        </h2>
        
        <div className="quiz-options" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, index) => {
            const isSelected = answers[question.id] === index
            const showResult = submitted && isSelected
            const isCorrect = index === question.correct_answer
            let optionClass = 'quiz-option'
            if (showResult) {
              optionClass += isCorrect ? ' correct' : ' incorrect'
            }
            return (
              <label key={index} className={optionClass}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={isSelected}
                  onChange={() => handleAnswer(question.id, index)}
                  disabled={submitted}
                />
                <span className="quiz-option-label">{option}</span>
                {showResult && isCorrect && (
                  <span className="badge badge-secondary" aria-label="Correct answer">✓ Correct</span>
                )}
                {showResult && !isCorrect && index === question.correct_answer && (
                  <span className="badge badge-secondary" aria-label="This was the correct answer">✓ Correct answer</span>
                )}
              </label>
            )
          })}
        </div>

        {submitted && answers[question.id] !== undefined && (
          <div className={`quiz-feedback visible ${answers[question.id] === question.correct_answer ? 'correct' : 'incorrect'}`} role="alert">
            <div className="quiz-feedback-title">
              {answers[question.id] === question.correct_answer ? 'Correct!' : 'Not quite right'}
            </div>
            <p>{question.explanation}</p>
          </div>
        )}
      </article>

      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-xl)'}}>
        <button
          className="btn btn-outline"
          onClick={handlePrev}
          disabled={currentQuestion === 0 || submitted}
          aria-label="Previous question"
        >
          Previous
        </button>
        <button
          className={currentQuestion === questions.length - 1 ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={handleNext}
          disabled={answers[question.id] === undefined || submitted}
          aria-label={currentQuestion === questions.length - 1 ? 'Submit practice' : 'Next question'}
        >
          {currentQuestion === questions.length - 1 ? 'Submit Practice' : 'Next'}
        </button>
      </div>
    </div>
  )
}