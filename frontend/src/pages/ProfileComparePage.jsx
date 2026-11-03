import { useState, useEffect } from 'react'
import { useLearnerContext } from '../context/LearnerContext'
import { api } from '../lib/api'

export default function ProfileComparePage() {
  const { learners } = useLearnerContext()
  const [lesson, setLesson] = useState(null)
  const [adaptedViews, setAdaptedViews] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLearnerIds, setSelectedLearnerIds] = useState(learners.slice(0, 2).map(l => l.id))
  const [activeSegment, setActiveSegment] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const lessonData = await api.getLesson('lesson-1')
        setLesson(lessonData)

        const views = {}
        for (const learnerId of selectedLearnerIds) {
          const data = await api.getAdaptedLesson('lesson-1', learnerId)
          views[learnerId] = data
        }
        setAdaptedViews(views)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedLearnerIds])

  const handleLearnerChange = (learnerId, checked) => {
    if (checked) {
      if (selectedLearnerIds.length < 3) {
        setSelectedLearnerIds([...selectedLearnerIds, learnerId])
      }
    } else {
      if (selectedLearnerIds.length > 1) {
        setSelectedLearnerIds(selectedLearnerIds.filter(id => id !== learnerId))
      }
    }
  }

  if (loading) {
    return (
      <div className="loading" role="status" aria-label="Loading comparison">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading profile comparison...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Error loading comparison: {error}</p>
        <button className="btn btn-primary" style={{marginTop: 'var(--spacing-md)'}} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon" aria-hidden="true">📊</div>
        <h2>No lesson data available</h2>
      </div>
    )
  }

  const segments = lesson.segments
  const currentSegment = segments[activeSegment]
  const currentConceptName = (() => {
    const cs = lesson.concepts.find(c => c.id === (currentSegment && currentSegment.concept_id))
    return cs ? cs.name : (currentSegment ? currentSegment.concept_id : '')
  })()

  return (
    <div>
      <section aria-labelledby="compare-title">
        <h1 id="compare-title" className="page-title">Profile Comparison</h1>
        <p className="page-subtitle">
          See how the same lesson adapts for different learner profiles. Select up to 3 profiles to compare side by side.
        </p>
      </section>

      <section aria-labelledby="selector-title" className="section">
        <h2 id="selector-title" className="section-title">Select Profiles to Compare</h2>
        <div className="grid grid-3">
          {learners.map(learner => (
            <label key={learner.id} className={`card ${selectedLearnerIds.includes(learner.id) ? 'selected' : ''}`} style={{cursor: 'pointer'}}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)'}}>
                <input
                  type="checkbox"
                  checked={selectedLearnerIds.includes(learner.id)}
                  onChange={(e) => handleLearnerChange(learner.id, e.target.checked)}
                  disabled={!selectedLearnerIds.includes(learner.id) && selectedLearnerIds.length >= 3}
                  style={{marginTop: '4px'}}
                />
                <div style={{flex: 1}}>
                  <h3 className="card-title" style={{marginBottom: 'var(--spacing-sm)'}}>{learner.name}</h3>
                  <dl style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)'}}>
                    <dt style={{color: 'var(--color-text-muted)'}}>Format:</dt>
                    <dd><span className="badge badge-primary">{learner.preferences.preferred_format}</span></dd>
                    <dt style={{color: 'var(--color-text-muted)'}}>Complexity:</dt>
                    <dd><span className="badge badge-outline">{learner.preferences.reading_complexity}</span></dd>
                    <dt style={{color: 'var(--color-text-muted)'}}>Pacing:</dt>
                    <dd><span className="badge badge-outline">{learner.preferences.pacing}</span></dd>
                    <dt style={{color: 'var(--color-text-muted)'}}>Text Size:</dt>
                    <dd><span className="badge badge-outline">{learner.preferences.text_size}</span></dd>
                    <dt style={{color: 'var(--color-text-muted)'}}>Contrast:</dt>
                    <dd><span className="badge badge-outline">{learner.preferences.contrast_mode}</span></dd>
                  </dl>
                </div>
              </div>
            </label>
          ))}
        </div>
        {selectedLearnerIds.length >= 3 && (
          <p className="form-hint" style={{marginTop: 'var(--spacing-md)'}}>
            Maximum 3 profiles for comparison. Uncheck one to select another.
          </p>
        )}
      </section>

      <section aria-labelledby="lesson-nav-title" className="section">
        <h2 id="lesson-nav-title" className="section-title">Lesson: {lesson.title}</h2>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px'}}>
          {lesson.segments.map((seg, i) => {
            const segConcept = lesson.concepts.find(c => c.id === seg.concept_id)
            const segName = segConcept ? segConcept.name : seg.concept_id
            return (
              <button
                key={seg.id}
                className={i === activeSegment ? 'btn btn-primary' : 'btn btn-outline'}
                style={{minWidth: 'auto', padding: '4px 8px'}}
                onClick={() => setActiveSegment(i)}
                aria-current={i === activeSegment ? 'step' : undefined}
                aria-label={'Section ' + (i + 1) + ': ' + segName}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="comparison-title" className="section">
        <h2 id="comparison-title" className="section-title">
          Section {activeSegment + 1}: {currentConceptName}
        </h2>
        
        <div className="grid" style={{gridTemplateColumns: `repeat(${selectedLearnerIds.length}, 1fr)`}}>
          {selectedLearnerIds.map(learnerId => {
            const learner = learners.find(l => l.id === learnerId)
            const view = adaptedViews[learnerId]
            const segment = view && view.adapted_segments ? view.adapted_segments[activeSegment] : null
            
            if (!learner || !view || !segment) {
              return (
                <div key={learnerId} className="card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--color-text-muted)'}}>
                  Loading...
                </div>
              )
            }

            const mastery = (learner.concept_mastery && learner.concept_mastery[segment.concept_id]) || 0

            return (
              <article key={learnerId} className="card" style={{display: 'flex', flexDirection: 'column', minHeight: '500px'}}>
                <header style={{marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)'}}>
                  <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)'}}>
                    {learner.name}
                  </h3>
                  <div style={{display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap'}}>
                    <span className={mastery < 0.4 ? 'badge badge-danger' : mastery < 0.7 ? 'badge badge-warning' : 'badge badge-secondary'}>
                      Mastery: {Math.round(mastery * 100)}%
                    </span>
                    <span className="badge badge-outline">Difficulty: {segment.difficulty}</span>
                    <span className="badge badge-outline">Format: {learner.preferences.preferred_format}</span>
                  </div>
                </header>

                <div className="explanation-banner" style={{marginBottom: 'var(--spacing-md)'}}>
                  <div className="explanation-title">Adaptations Applied:</div>
                  <ul className="explanation-list">
                    {view.explanations.slice(0, 3).map((exp, i) => (
                      <li key={i} style={{fontSize: 'var(--font-size-sm)'}}>{exp}</li>
                    ))}
                  </ul>
                </div>

                <div className="lesson-content" style={{flex: 1, overflow: 'auto'}}>
                  <div dangerouslySetInnerHTML={{__html: (segment.adapted_content || segment.original_content).replace(/\n/g, '<br>')}} />
                </div>

                {(learner.preferences.preferred_format === 'visual' || learner.preferences.preferred_format === 'combined') && segment.visual_steps && (
                  <section aria-labelledby={'visual-' + learnerId} style={{marginTop: 'var(--spacing-lg)'}}>
                    <h4 id={'visual-' + learnerId} style={{fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-sm)'}}>
                      Visual Steps
                    </h4>
                    <div className="visual-steps" style={{gap: 'var(--spacing-sm)'}}>
                      {segment.visual_steps.slice(0, 3).map((step, i) => (
                        <div key={i} className="visual-step" style={{padding: 'var(--spacing-sm)'}}>
                          <span className="visual-step-number" style={{width: '1.5rem', height: '1.5rem', fontSize: 'var(--font-size-sm)'}}>{i + 1}</span>
                          <div className="visual-step-content">
                            <div className="visual-step-title" style={{fontSize: 'var(--font-size-sm)'}}>{step}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(learner.preferences.preferred_format === 'audio' || learner.preferences.preferred_format === 'combined') && (
                  <div className="audio-player" style={{marginTop: 'var(--spacing-lg)'}}>
                    <button className="audio-player-btn" disabled aria-label="Audio preview not available in comparison view">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                    <span style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)'}}>
                      Audio available in learner view
                    </span>
                  </div>
                )}

                <footer style={{marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)'}}>
                  <div style={{display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap'}}>
                    <span className="badge badge-outline">{learner.preferences.reading_complexity} complexity</span>
                    <span className="badge badge-outline">{learner.preferences.pacing} pacing</span>
                    <span className="badge badge-outline">{learner.preferences.text_size} text</span>
                    <span className="badge badge-outline">{learner.preferences.contrast_mode} contrast</span>
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="key-diffs-title" className="section">
        <h2 id="key-diffs-title" className="section-title">Key Differences Summary</h2>
        <div className="grid grid-2">
          {selectedLearnerIds.map(learnerId => {
            const learner = learners.find(l => l.id === learnerId)
            const view = adaptedViews[learnerId]
            if (!learner || !view) return null
            
            return (
              <article key={learnerId} className="card">
                <h3 className="card-title">{learner.name}</h3>
                <ul style={{listStyle: 'disc', paddingLeft: 'var(--spacing-xl)', color: 'var(--color-text)'}}>
                  {view.explanations.map((exp, i) => (
                    <li key={i} style={{marginBottom: 'var(--spacing-sm)'}}>{exp}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}