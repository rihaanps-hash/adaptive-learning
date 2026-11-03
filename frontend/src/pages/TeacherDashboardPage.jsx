import { useState, useEffect } from 'react'
import { useLearnerContext } from '../context/LearnerContext'
import { api } from '../lib/api'

export default function TeacherDashboardPage() {
  const { learners } = useLearnerContext()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLearner, setSelectedLearner] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const data = await api.getTeacherDashboard()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="loading" role="status" aria-label="Loading teacher dashboard">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading teacher dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Error loading dashboard: {error}</p>
        <button className="btn btn-primary" style={{marginTop: 'var(--spacing-md)'}} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  const learnerData = dashboardData?.learners || []

  const getMasteryClass = (value) => {
    if (value < 0.4) return 'low'
    if (value < 0.7) return 'medium'
    return 'high'
  }

  const getMasteryBadge = (value) => {
    const percent = Math.round(value * 100)
    if (value < 0.4) return <span className="badge badge-danger">{percent}%</span>
    if (value < 0.7) return <span className="badge badge-warning">{percent}%</span>
    return <span className="badge badge-secondary">{percent}%</span>
  }

  return (
    <div>
      <section aria-labelledby="teacher-title">
        <h1 id="teacher-title" className="page-title">Teacher Dashboard</h1>
        <p className="page-subtitle">
          Monitor learner progress, concept mastery, and get personalized recommendations.
        </p>
      </section>

      <section aria-labelledby="overview-title" className="section">
        <h2 id="overview-title" className="section-title">Class Overview</h2>
        <div className="grid grid-3">
          {learnerData.map(learner => (
            <article key={learner.learner_id} className={`card ${selectedLearner === learner.learner_id ? 'selected' : ''}`} 
              onClick={() => setSelectedLearner(selectedLearner === learner.learner_id ? null : learner.learner_id)}
              style={{cursor: 'pointer', transition: 'all var(--transition-fast)'}}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)'}}>
                <div>
                  <h3 className="card-title" style={{marginBottom: 'var(--spacing-xs)'}}>{learner.name}</h3>
                  <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>
                    {learner.total_quizzes} questions answered
                  </p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)'}}>
                    {Math.round(learner.overall_progress * 100)}%
                  </div>
                  <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>Overall Progress</div>
                </div>
              </div>
              <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(learner.overall_progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${learner.name} overall progress`}>
                <div className={`progress-fill ${getMasteryClass(learner.overall_progress)}`} style={{width: `${learner.overall_progress * 100}%`}}></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedLearner && dashboardData && (
        <section aria-labelledby="detail-title" className="section">
          <h2 id="detail-title" className="section-title">Learner Detail</h2>
          {learnerData.map(learner => {
            if (learner.learner_id !== selectedLearner) return null
            
            return (
              <div key={learner.learner_id}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-md)'}}>
                  <div>
                    <h3 style={{fontSize: 'var(--font-size-xl)'}}>{learner.name}</h3>
                    <p style={{color: 'var(--color-text-muted)'}}>
                      {learner.total_quizzes} total questions • Overall: {Math.round(learner.overall_progress * 100)}%
                    </p>
                  </div>
                  <button className="btn btn-outline" onClick={() => setSelectedLearner(null)}>
                    Close Detail
                  </button>
                </div>

                <div className="grid grid-2" style={{marginBottom: 'var(--spacing-xl)'}}>
                  <div className="card">
                    <h3 className="card-title">Preferences</h3>
                    <dl style={{display: 'grid', gap: 'var(--spacing-sm)'}}>
                      <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Preferred Format</dt>
                      <dd><span className="badge badge-primary">{learner.preferences.preferred_format}</span></dd>
                      <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Text Size</dt>
                      <dd><span className="badge badge-outline">{learner.preferences.text_size}</span></dd>
                      <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Contrast Mode</dt>
                      <dd><span className="badge badge-outline">{learner.preferences.contrast_mode}</span></dd>
                      <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Reading Complexity</dt>
                      <dd><span className="badge badge-outline">{learner.preferences.reading_complexity}</span></dd>
                      <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Pacing</dt>
                      <dd><span className="badge badge-outline">{learner.preferences.pacing}</span></dd>
                    </dl>
                  </div>

                  <div className="card">
                    <h3 className="card-title">Recommendations</h3>
                    {learner.suggested_next_concept && (
                      <div className="alert alert-info">
                        <strong>Suggested Next Focus:</strong> {learner.suggested_next_concept_name}
                        <p className="form-hint" style={{marginTop: 'var(--spacing-xs)'}}>
                          This concept has the lowest mastery ({Math.round((learner.concept_mastery[learner.suggested_next_concept] || 0) * 100)}%).
                          Consider assigning additional practice or review.
                        </p>
                      </div>
                    )}
                    <div style={{marginTop: 'var(--spacing-md)'}}>
                      <h4 style={{marginBottom: 'var(--spacing-sm)'}}>Adaptation Notes:</h4>
                      <ul style={{listStyle: 'disc', paddingLeft: 'var(--spacing-xl)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>
                        <li>Content format: {learner.preferences.preferred_format}</li>
                        <li>Text complexity: {learner.preferences.reading_complexity}</li>
                        <li>Pacing: {learner.preferences.pacing}</li>
                        <li>Text size: {learner.preferences.text_size}</li>
                        <li>Contrast: {learner.preferences.contrast_mode}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card" style={{marginBottom: 'var(--spacing-xl)'}}>
                  <h3 className="card-title">Concept Mastery</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Concept</th>
                        <th>Mastery</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(learner.concept_mastery).map(([conceptId, mastery]) => (
                        <tr key={conceptId}>
                          <td>{conceptId.replace('concept-', 'Concept ')}</td>
                          <td>
                            <div className="progress-bar" style={{width: '150px'}}>
                              <div className={`progress-fill ${getMasteryClass(mastery)}`} style={{width: `${mastery * 100}%`}}></div>
                            </div>
                          </td>
                          <td>{getMasteryBadge(mastery)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {learner.recent_quizzes.length > 0 && (
                  <div className="card">
                    <h3 className="card-title">Recent Quiz Activity</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Concept</th>
                          <th>Result</th>
                          <th>Mastery Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {learner.recent_quizzes.slice().reverse().map((quiz, i) => (
                          <tr key={i}>
                            <td>{quiz.question_id}</td>
                            <td>{quiz.concept_id.replace('concept-', 'Concept ')}</td>
                            <td>
                              <span className={quiz.correct ? 'badge badge-secondary' : 'badge badge-danger'}>
                                {quiz.correct ? 'Correct' : 'Incorrect'}
                              </span>
                            </td>
                            <td>
                              {quiz.previous_mastery !== undefined && quiz.new_mastery !== undefined ? (
                                <span className={quiz.new_mastery > quiz.previous_mastery ? 'badge badge-secondary' : 'badge badge-outline'}>
                                  {Math.round(quiz.previous_mastery * 100)}% → {Math.round(quiz.new_mastery * 100)}%
                                </span>
                              ) : (
                                <span className="badge badge-outline">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      )}

      <section aria-labelledby="comparison-title" className="section">
        <h2 id="comparison-title" className="section-title">Side-by-Side Comparison</h2>
        <p className="section-subtitle">
          Compare how the same lesson adapts for different learner profiles.
        </p>
        <div className="grid grid-2">
          {learnerData.map(learner => (
            <article key={learner.learner_id} className="card">
              <h3 className="card-title">{learner.name}</h3>
              <dl style={{display: 'grid', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)'}}>
                <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Format</dt>
                <dd><span className="badge badge-primary">{learner.preferences.preferred_format}</span></dd>
                <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Complexity</dt>
                <dd><span className="badge badge-outline">{learner.preferences.reading_complexity}</span></dd>
                <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Pacing</dt>
                <dd><span className="badge badge-outline">{learner.preferences.pacing}</span></dd>
                <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Text Size</dt>
                <dd><span className="badge badge-outline">{learner.preferences.text_size}</span></dd>
                <dt style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Contrast</dt>
                <dd><span className="badge badge-outline">{learner.preferences.contrast_mode}</span></dd>
              </dl>
              <div>
                <h4 style={{marginBottom: 'var(--spacing-sm)'}}>Concept Mastery</h4>
                {Object.entries(learner.concept_mastery).map(([conceptId, mastery]) => (
                  <div key={conceptId} style={{marginBottom: 'var(--spacing-sm)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)'}}>
                      <span style={{fontSize: 'var(--font-size-sm)'}}>{conceptId.replace('concept-', 'Concept ')}</span>
                      <span style={{fontSize: 'var(--font-size-sm)', fontWeight: 600}}>{Math.round(mastery * 100)}%</span>
                    </div>
                    <div className="progress-bar" style={{height: '6px'}}>
                      <div className={`progress-fill ${getMasteryClass(mastery)}`} style={{width: `${mastery * 100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}