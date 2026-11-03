import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'
import { api } from '../lib/api'

const ONBOARDING_QUESTIONS = [
  {
    id: 'ob1',
    concept_id: 'concept-1',
    question: 'What is the main purpose of photosynthesis?',
    options: [
      'To produce oxygen for animals to breathe',
      'To create food (glucose) for the plant',
      'To absorb sunlight for heat',
      'To release carbon dioxide'
    ],
    correct_answer: 1,
    explanation: 'Photosynthesis primarily creates glucose (food) for the plant. Oxygen is a byproduct.'
  },
  {
    id: 'ob2',
    concept_id: 'concept-1',
    question: 'Which three things does a plant need for photosynthesis?',
    options: [
      'Sunlight, soil, and fertilizer',
      'Sunlight, carbon dioxide, and water',
      'Water, oxygen, and soil',
      'Carbon dioxide, oxygen, and sunlight'
    ],
    correct_answer: 1,
    explanation: 'Plants need sunlight (energy), carbon dioxide (from air), and water (from roots).'
  },
  {
    id: 'ob3',
    concept_id: 'concept-2',
    question: 'In the photosynthesis equation, what is produced along with glucose?',
    options: ['Carbon dioxide', 'Water', 'Oxygen', 'Nitrogen'],
    correct_answer: 2,
    explanation: 'The equation 6CO2 + 6H2O → C6H12O6 + 6O2 shows oxygen is produced.'
  },
  {
    id: 'ob4',
    concept_id: 'concept-2',
    question: 'What does chlorophyll do in photosynthesis?',
    options: [
      'Absorbs sunlight',
      'Releases oxygen',
      'Absorbs carbon dioxide',
      'Stores glucose'
    ],
    correct_answer: 0,
    explanation: 'Chlorophyll is the green pigment that captures light energy.'
  },
  {
    id: 'ob5',
    concept_id: 'concept-3',
    question: 'Where do light-dependent reactions occur?',
    options: ['In the stroma', 'In the thylakoid membranes', 'In the mitochondria', 'In the nucleus'],
    correct_answer: 1,
    explanation: 'Light-dependent reactions happen in the thylakoid membranes of chloroplasts.'
  },
]

export default function OnboardingQuizPage() {
  const { learnerId } = useParams()
  const { currentLearner, updateLearner } = useLearnerContext()
  const navigate = useNavigate()

  const learner = currentLearner?.id === learnerId ? currentLearner : null

  if (!learner) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Learner profile not found.</p>
      </div>
    )
  }

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState([])
  const [completed, setCompleted] = useState(false)

  const question = ONBOARDING_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / ONBOARDING_QUESTIONS.length) * 100

  const handleAnswer = (questionId, selectedIndex) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: selectedIndex }))
  }

  const handleNext = () => {
    if (answers[question.id] === undefined) {
      alert('Please select an answer before continuing.')
      return
    }
    if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
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
    
    for (const q of ONBOARDING_QUESTIONS) {
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
      updateLearner({ ...learner, concept_mastery: data.updated_mastery, quiz_history: [...learner.quiz_history, ...data.results] })
      setCompleted(true)
    } catch (err) {
      alert('Error submitting quiz: ' + err.message)
      setSubmitted(false)
    }
  }

  const handleContinue = () => {
    navigate(`/learner/${learnerId}/lesson/lesson-1`)
  }

  if (completed) {
    const correctCount = results.filter(r => r.correct).length
    return (
      <div>
        <section aria-labelledby="complete-title">
          <h1 id="complete-title" className="page-title">Onboarding Quiz Complete!</h1>
          <p className="page-subtitle">
            You answered {correctCount} out of {ONBOARDING_QUESTIONS.length} questions correctly.
          </p>
        </section>

        <section aria-labelledby="results-title" className="section">
          <h2 id="results-title" className="section-title">Results</h2>
          <div className="grid grid-2">
            {results.map((result, i) => (
              <article key={result.question_id} className={`card ${result.correct ? '' : ''}`}>
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

        <div style={{display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', marginTop: 'var(--spacing-xl)'}}>
          <button className="btn btn-primary" onClick={handleContinue} style={{minWidth: '200px'}}>
            Start Lesson
          </button>
          <button className="btn btn-outline" onClick={() => navigate(`/learner/${learnerId}`)}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section aria-labelledby="quiz-title">
        <h1 id="quiz-title" className="page-title">Onboarding Quiz</h1>
        <p className="page-subtitle">
          This short quiz helps us understand your starting knowledge so we can personalize your lesson.
        </p>
      </section>

      <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress" style={{marginBottom: 'var(--spacing-lg)'}}>
        <div className="progress-fill" style={{width: `${progress}%`}}></div>
      </div>
      <p style={{textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)'}}>
        Question {currentQuestion + 1} of {ONBOARDING_QUESTIONS.length}
      </p>

      <article className="quiz-question" aria-labelledby={`question-${question.id}`}>
        <h2 id={`question-${question.id}`} className="quiz-question-text">
          {question.question}
        </h2>
        
        <div className="quiz-options" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, index) => (
            <label key={index} className="quiz-option">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={answers[question.id] === index}
                onChange={() => handleAnswer(question.id, index)}
                disabled={submitted}
              />
              <span className="quiz-option-label">{option}</span>
            </label>
          ))}
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
          className={currentQuestion === ONBOARDING_QUESTIONS.length - 1 ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={handleNext}
          disabled={answers[question.id] === undefined || submitted}
          aria-label={currentQuestion === ONBOARDING_QUESTIONS.length - 1 ? 'Submit quiz' : 'Next question'}
        >
          {currentQuestion === ONBOARDING_QUESTIONS.length - 1 ? 'Submit Quiz' : 'Next'}
        </button>
      </div>
    </div>
  )
}