import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'

export default function LearnerDashboardPage() {
  const { learnerId } = useParams()
  const { currentLearner, updateLearner } = useLearnerContext()
  const navigate = useNavigate()

  const learner = currentLearner?.id === learnerId ? currentLearner : null

  if (!learner) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Learner profile not found.</p>
        <Link to="/" className="btn btn-primary" style={{marginTop: 'var(--spacing-md)'}}>
          Go Home
        </Link>
      </div>
    )
  }

  const masteryEntries = Object.entries(learner.concept_mastery)
  const overallProgress = masteryEntries.length > 0
    ? masteryEntries.reduce((sum, [, v]) => sum + v, 0) / masteryEntries.length
    : 0

  const handleStartLesson = () => {
    navigate(`/learner/${learnerId}/lesson/lesson-1`)
  }

  const handleRetakeQuiz = () => {
    navigate(`/learner/${learnerId}/quiz`)
  }

  return (
    <div>
      <section aria-labelledby="dashboard-title">
        <h1 id="dashboard-title" className="page-title">{learner.name}</h1>
        <p className="page-subtitle">Your personalized learning dashboard</p>
      </section>

      <section aria-labelledby="progress-title" className="section">
        <h2 id="progress-title" className="section-title">Overall Progress</h2>
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-sm)'}}>
            <div>
              <div style={{fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-primary)'}}>
                {Math.round(overallProgress * 100)}%
              </div>
              <div style={{color: 'var(--color-text-muted)'}}>Concept mastery average</div>
            </div>
            <div className="progress-bar" style={{width: '200px', flexShrink: 0}} role="progressbar" aria-valuenow={Math.round(overallProgress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Overall concept mastery">
              <div className={`progress-fill ${overallProgress < 0.4 ? 'low' : overallProgress < 0.7 ? 'medium' : 'high'}`} style={{width: `${overallProgress * 100}%`}}></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="mastery-title" className="section">
        <h2 id="mastery-title" className="section-title">Concept Mastery</h2>
        <div className="grid grid-3">
          {masteryEntries.map(([conceptId, mastery]) => (
            <article key={conceptId} className="mastery-card">
              <div className="mastery-header">
                <span className="mastery-concept">
                  {learner.concept_mastery && Object.keys(learner.concept_mastery).includes(conceptId)
                    ? conceptId.replace('concept-', 'Concept ')
                    : conceptId}
                </span>
                <span className={`mastery-value ${mastery < 0.4 ? 'low' : mastery < 0.7 ? 'medium' : 'high'}`}>
                  {Math.round(mastery * 100)}%
                </span>
              </div>
              <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(mastery * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${conceptId} mastery`}>
                <div className={`progress-fill ${mastery < 0.4 ? 'low' : mastery < 0.7 ? 'medium' : 'high'}`} style={{width: `${mastery * 100}%`}}></div>
              </div>
              <button
                className="btn btn-outline"
                style={{width: '100%', marginTop: 'var(--spacing-md)'}}
                onClick={() => navigate(`/learner/${learnerId}/quiz/${conceptId}`)}
              >
                Practice
              </button>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="actions-title" className="section">
        <h2 id="actions-title" className="section-title">Continue Learning</h2>
        <div style={{display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap'}}>
          <Link to={`/learner/${learnerId}/lesson/lesson-1`} className="btn btn-primary" style={{flex: 1, minWidth: '200px'}}>
            View Lesson: Understanding Photosynthesis
          </Link>
          <Link to={`/learner/${learnerId}/preferences`} className="btn btn-outline" style={{flex: 1, minWidth: '200px'}}>
            Edit Preferences
          </Link>
          <button className="btn btn-secondary" style={{flex: 1, minWidth: '200px'}} onClick={handleRetakeQuiz}>
            Retake Onboarding Quiz
          </button>
        </div>
      </section>

      <section aria-labelledby="prefs-title" className="section">
        <h2 id="prefs-title" className="section-title">Current Preferences</h2>
        <div className="grid grid-3">
          <div className="card">
            <h3 className="card-title">Format & Display</h3>
            <dl style={{display: 'grid', gap: 'var(--spacing-sm)'}}>
              <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Preferred Format</dt>
              <dd><span className="badge badge-primary">{learner.preferences.preferred_format}</span></dd>
              <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Text Size</dt>
              <dd><span className="badge badge-outline">{learner.preferences.text_size}</span></dd>
              <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Contrast Mode</dt>
              <dd><span className="badge badge-outline">{learner.preferences.contrast_mode}</span></dd>
            </dl>
          </div>
          <div className="card">
            <h3 className="card-title">Reading & Pacing</h3>
            <dl style={{display: 'grid', gap: 'var(--spacing-sm)'}}>
              <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Reading Complexity</dt>
              <dd><span className="badge badge-outline">{learner.preferences.reading_complexity}</span></dd>
              <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Pacing</dt>
              <dd><span className="badge badge-outline">{learner.preferences.pacing}</span></dd>
            </dl>
          </div>
          <div className="card">
            <h3 className="card-title">Quiz History</h3>
            <p style={{color: 'var(--color-text-muted)'}}>{learner.quiz_history?.length || 0} questions answered</p>
            {learner.quiz_history?.length > 0 && (
              <div style={{marginTop: 'var(--spacing-md)'}}>
                {learner.quiz_history.slice(-3).map((q, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-xs) 0', borderBottom: '1px solid var(--color-border)'}}>
                    <span style={{fontSize: 'var(--font-size-sm)'}}>Q{q.question_id}</span>
                    <span className={q.correct ? 'badge badge-secondary' : 'badge badge-danger'}>
                      {q.correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}